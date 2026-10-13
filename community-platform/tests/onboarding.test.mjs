import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MemberStore } from "../lib/members.mjs";
import { publicGraph } from "../lib/public-viewer.mjs";
import { memberDbPath, storageDiagnostics } from "../lib/storage.mjs";
// Synthetic people only; no real family records or accounts are used.
const digest = (s) => createHash("sha256").update(s).digest("hex");
const password = "Synthetic onboarding phrase";
async function account(db, admin, username, name) {
  const r = await db.register({ username, name, password, code: db.invite(admin, name).code, adult: true, consent: true });
  return { id: db.actor(r.token).id, token: r.token };
}
async function fixture() {
  const db = new MemberStore(":memory:");
  db.run("INSERT INTO meta VALUES('owner_setup',?)", digest("owner-code"));
  const owner = await db.register({ username: "owner", name: "Synthetic Owner", password, code: "owner-code", adult: true, consent: true }, true);
  const admin = db.actor(owner.token).id;
  const member = (await account(db, admin, "member", "Synthetic Member")).id;
  const people = [
    ["g1", "धरम सिंह", "गाँव-क"],
    ["f1", "हरि सिंह", "गाँव-क"],
    ["m1", "राम कुमार", "गाँव-क"],
    ["f2", "मोहन लाल", "गाँव-ख"],
    ["m2", "राम कुमार", "गाँव-ख"],
    ["hidden", "राम कुमार", "गाँव-ग"],
    ["kid", "राम कुमार", "गाँव-घ"],
  ];
  for (const [id, name, village] of people)
    db.run("INSERT INTO people(id,name,village,source,kind,generation) VALUES(?,?,?,?,?,?)", id, name, village, "Synthetic archive", "archive", "5");
  for (const [a, b] of [["g1", "f1"], ["f1", "m1"], ["f2", "m2"]])
    db.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)", a + b, a, b, "parent", "father", "Synthetic archive");
  db.run("INSERT INTO profile_privacy VALUES('hidden','private','adult','private','','','',0)");
  db.run("INSERT INTO profile_privacy VALUES('kid','verified','child','private','','','',0)");
  return { db, admin, member };
}
const approve = (f, reviewer, claim) =>
  f.db.verifyClaim(reviewer, claim, true, "Checked with a known synthetic relative.", "family_knowledge");

test("signup leaves the account unlinked until an explicit candidate is chosen and claimed", async () => {
  const f = await fixture();
  try {
    assert.equal(f.db.memberState(f.member).onboarding.required, true);
    assert.throws(() => f.db.claimCandidates(f.member, { name: "राम कुमार" }), /village or your father/);
    const both = f.db.claimCandidates(f.member, { name: "राम कुमार", parent: "सिंह" });
    assert.deepEqual(both.candidates.map((c) => c.id), ["m1"], "parent narrows; private and child entries never listed");
    const byVillage = f.db.claimCandidates(f.member, { name: "राम  कुमार।", village: "गाँव-ख" });
    assert.deepEqual(byVillage.candidates.map((c) => c.id), ["m2"]);
    assert.equal(byVillage.candidates[0].father.name, "मोहन लाल");
    const m1 = f.db.claimCandidates(f.member, { name: "राम कुमार", village: "गाँव-क" }).candidates[0];
    assert.equal(m1.grandfather.name, "धरम सिंह");
    const search = { searchName: "राम कुमार", searchVillage: "गाँव-ख" };
    const reason = "My father Mohan Lal is known to the reviewer.";
    assert.throws(() => f.db.requestNodeClaim(f.member, { ...search, id: "m2", reason }), /Confirm/);
    assert.throws(() => f.db.requestNodeClaim(f.member, { ...search, id: "m1", reason, confirm: true }), /listed archive entries/);
    assert.throws(() => f.db.requestNodeClaim(f.member, { ...search, id: "hidden", reason, confirm: true }), /listed archive entries/);
    const claim = f.db.requestNodeClaim(f.member, { ...search, id: "m2", reason, confirm: true });
    const state = f.db.memberState(f.member);
    assert.equal(state.onboarding.required, false);
    assert.equal(state.onboarding.claim.status, "pending");
    assert.equal(state.claims[0].search_village, "गाँव-ख");
    assert.equal(state.claims[0].similar, undefined, "members do not see reviewer-only similarity counts");
    assert.equal(f.db.memberState(f.admin).claims.find((c) => c.id === claim).person_parent, "मोहन लाल");
    assert.throws(() => f.db.requestNodeClaim(f.member, { searchName: "राम कुमार", searchVillage: "गाँव-क", id: "m1", reason, confirm: true }), /already has a personal profile/);
    assert.throws(() => f.db.requestClaim(f.member, "m1", reason, "self"), /already has a personal profile/);
    f.db.run("UPDATE proposals SET due=0");
    f.db.tick();
    assert.equal(f.db.one("SELECT status FROM claims WHERE id=?", claim).status, "pending", "identity is never approved by time");
    assert.throws(() => approve(f, f.member, claim), /Administrator/);
    approve(f, f.admin, claim);
    assert.equal(f.db.memberState(f.member).onboarding.claim.status, "approved");
    // Rejection or revocation returns the account to onboarding.
    f.db.revokeVerification(f.admin, f.member, "Synthetic test of revocation behaviour.");
    assert.equal(f.db.memberState(f.member).onboarding.required, true);
  } finally {
    f.db.close();
  }
});

test("a missing person becomes one private new-profile request, duplicate-checked and retired if declined", async () => {
  const f = await fixture();
  try {
    const base = { name: "राम कुमार", village: "गाँव-क", reason: "My father Hari Singh can be confirmed by elders." };
    assert.throws(() => f.db.requestNewProfile(f.member, { ...base, notListed: true }), /father's or mother's name/);
    assert.throws(() => f.db.requestNewProfile(f.member, { ...base, parentName: "हरि सिंह" }), /none of the listed/);
    assert.throws(() => f.db.requestNewProfile(f.member, { ...base, parentName: "हरि सिंह", notListed: true }), /already recorded/);
    const id = f.db.requestNewProfile(f.member, { ...base, parentName: "हरि सिंह", notListed: true, confirmDistinct: true });
    assert.equal(f.db.privacy(id).audience, "private");
    assert.equal(f.db.one("SELECT COUNT(*) n FROM relationships WHERE a=? OR b=?", id, id).n, 0, "the parent name is review context, not a graph edge");
    const claim = f.db.memberState(f.admin).claims.find((c) => c.person_id === id);
    assert.equal(claim.search_parent, "हरि सिंह");
    assert.equal(claim.similar, 1);
    f.db.verifyClaim(f.admin, claim.id, false, "Reviewer found this is the existing entry.", "family_records");
    assert.equal(f.db.person(id), undefined, "declined orphan profile is retired");
    assert.equal(f.db.memberState(f.member).onboarding.required, true);
  } finally {
    f.db.close();
  }
});

const status = (f, id) => f.db.one("SELECT status FROM proposals WHERE id=?", id).status;
test("structured relative proposals are sourced, wait for identity approval, then follow the objection window and stay inside the family circle", async () => {
  const f = await fixture();
  try {
    const spouse = { relation: "spouse", name: "Dr. Synthetic Spouse", gender: "female", village: "Synthetic Town", life: "adult", sourceType: "family_knowledge", source: "Marriage known to both families; synthetic test.", marriage: "Married 2015, synthetic" };
    assert.throws(() => f.db.proposeRelative(f.admin, spouse), /own family entry first/);
    // The owner links their own node; the claim waits for a second reviewer.
    const own = f.db.requestNodeClaim(f.admin, { searchName: "राम कुमार", searchVillage: "गाँव-क", id: "m1", reason: "Owner's own synthetic node for review.", confirm: true });
    assert.throws(() => f.db.proposeRelative(f.admin, { ...spouse, source: "short" }), /source/);
    assert.throws(() => f.db.proposeRelative(f.admin, { ...spouse, life: "" }), /life stage/);
    const proposal = f.db.proposeRelative(f.admin, spouse);
    assert.throws(() => f.db.proposeRelative(f.admin, spouse), /already awaiting review/);
    f.db.saveIntroduction(f.admin, { about_hi: "", about_en: "", family_hi: "", family_en: "My wife is Dr. Another Name." });
    assert.equal(f.db.one("SELECT COUNT(*) n FROM people WHERE name LIKE '%Another Name%'").n, 0, "introduction prose never creates people or edges");
    f.db.run("UPDATE proposals SET due=0");
    f.db.tick();
    assert.equal(status(f, proposal), "pending", "waits (not a conflict) while the proposer's identity is unverified");
    assert.throws(() => f.db.decide(f.admin, proposal, "accept", "Owner tries to accept own proposal."), /separate reviewer/);
    // A verified relative becomes the second reviewer.
    const reviewerClaim = f.db.requestNodeClaim(f.member, { searchName: "राम कुमार", searchVillage: "गाँव-ख", id: "m2", reason: "Reviewer's own synthetic node for review.", confirm: true });
    approve(f, f.admin, reviewerClaim);
    await f.db.appointReviewer(f.admin, f.member, password, "Synthetic second reviewer for this test.");
    assert.throws(() => f.db.decide(f.member, proposal, "accept", "Accepting before identity approval."), /identity claim must be approved/);
    approve(f, f.member, own);
    assert.ok(f.db.one("SELECT due FROM proposals WHERE id=?", proposal).due > Date.now() + 6 * 86400000, "a full objection window starts after identity approval");
    f.db.tick();
    assert.equal(status(f, proposal), "pending");
    const objected = f.db.proposeRelative(f.admin, { ...spouse, relation: "mother", name: "Synthetic Mother", source: "Second synthetic proposal used to test objections." });
    f.db.object(f.member, objected, "This synthetic mother is disputed by a relative.");
    f.db.run("UPDATE proposals SET due=0");
    f.db.tick();
    assert.equal(status(f, proposal), "auto_accepted", "valid, unopposed and conflict-free: accepted after the window");
    assert.equal(status(f, objected), "disputed", "an objection pauses acceptance for an administrator");
    const added = f.db.one("SELECT person_id FROM proposals WHERE id=?", proposal).person_id;
    assert.equal(f.db.privacy(added).audience, "private");
    assert.equal(f.db.familyFor(f.admin, "m1").spouses[0].name, "Dr. Synthetic Spouse");
    const outsider = (await account(f.db, f.admin, "outsider", "Synthetic Outsider")).id;
    f.db.run("UPDATE credentials SET verified=1 WHERE account_id=?", outsider);
    assert.equal(f.db.familyFor(outsider, "m1").spouses.length, 0, "other verified members do not see the private relative");
    assert.throws(() => f.db.familyFor(outsider, added), (e) => e.status === 404);
    assert.equal(publicGraph(f.db.db).records.some((p) => p.id === added), false);
    assert.equal(JSON.stringify(publicGraph(f.db.db)).includes("Synthetic Spouse"), false);
  } finally {
    f.db.close();
  }
});

test("relative links between archive entries and child relatives respect public and child rules", async () => {
  const f = await fixture();
  try {
    const own = f.db.requestNodeClaim(f.member, { searchName: "राम कुमार", searchVillage: "गाँव-क", id: "m1", reason: "Member's own synthetic node for review.", confirm: true });
    approve(f, f.admin, own);
    const before = publicGraph(f.db.db).edges.length;
    const mother = f.db.proposeRelative(f.member, { relation: "mother", existingId: "f2", gender: "female", village: "गाँव-ख", life: "deceased", sourceType: "archive_record", source: "Synthetic link between two archive entries." });
    f.db.decide(f.admin, mother, "accept", "Moderator checked the synthetic source.");
    assert.equal(publicGraph(f.db.db).edges.length, before + 1, "an accepted link between two public archive entries is shown");
    assert.equal(f.db.familyFor(f.member, "m1").parents.length, 2);
    const child = f.db.proposeRelative(f.member, { relation: "daughter", name: "Synthetic Daughter", gender: "female", village: "गाँव-क", life: "child", sourceType: "family_knowledge", source: "Synthetic child of the member for testing." });
    f.db.run("UPDATE proposals SET due=0 WHERE id=?", child);
    f.db.tick();
    assert.equal(status(f, child), "pending", "a child's record is never accepted by the clock");
    f.db.decide(f.admin, child, "accept", "Moderator checked the synthetic child record.");
    const kid = f.db.one("SELECT person_id FROM proposals WHERE id=?", child).person_id;
    assert.equal(f.db.privacy(kid).life, "child");
    assert.equal(f.db.familyFor(f.member, "m1").children[0].id, kid, "parent sees their own child");
    const other = await account(f.db, f.admin, "sibling", "Synthetic Sibling");
    const claim = f.db.requestNodeClaim(other.id, { searchName: "हरि सिंह", searchVillage: "गाँव-क", id: "f1", reason: "Another synthetic family member.", confirm: true });
    approve(f, f.admin, claim);
    assert.equal(f.db.familyFor(other.id, "m1").children.length, 0, "a child is not shown to wider family");
    f.db.restrict(f.admin, kid, "Synthetic safeguarding hold for testing.");
    assert.equal(f.db.familyFor(f.member, "m1").children.length, 0, "privacy hold overrides family visibility");
  } finally {
    f.db.close();
  }
});

test("an added adult claims her own entry with the family code, and only her own consent publishes her", async () => {
  const f = await fixture();
  try {
    approve(f, f.admin, f.db.requestNodeClaim(f.member, { searchName: "राम कुमार", searchVillage: "गाँव-क", id: "m1", reason: "Member's own synthetic node for review.", confirm: true }));
    const wife = f.db.proposeRelative(f.member, { relation: "spouse", name: "Synthetic Wife", gender: "female", village: "Synthetic Town", life: "adult", sourceType: "family_knowledge", source: "Marriage known to both synthetic families." });
    f.db.run("UPDATE proposals SET due=0");
    f.db.tick();
    const added = f.db.one("SELECT person_id FROM proposals WHERE id=?", wife).person_id;
    const code = f.db.one("SELECT public_code FROM people WHERE id=?", added).public_code;
    assert.match(code, /^LV-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/, "random code with no encoded attributes");
    assert.equal(f.db.memberState(f.member).proposals.find((p) => p.id === wife).person_code, code);
    const her = await account(f.db, f.admin, "wife", "Synthetic Wife");
    assert.equal(f.db.claimCandidates(her.id, { name: "Synthetic Wife", village: "Synthetic Town" }).total, 0, "private relatives never appear in name search");
    assert.equal(f.db.claimCandidates(her.id, { code: code.toLowerCase() }).candidates[0].id, added);
    const claim = f.db.requestNodeClaim(her.id, { searchCode: code, id: added, reason: "My husband gave me this family code.", confirm: true });
    approve(f, f.admin, claim);
    assert.equal(f.db.claimCandidates(her.id, { code }).total, 0, "a claimed code cannot be claimed again");
    assert.equal(publicGraph(f.db.db).records.some((p) => p.id === added), false);
    const settings = { life: "adult", audience: "public", contactAudience: "private", profileConsent: true, email: "wife@example.test", phone: "", city: "" };
    assert.throws(() => f.db.savePrivacy(f.member, added, { ...settings, publicConsent: true }), (e) => e.status === 403, "a relative cannot publish her");
    assert.throws(() => f.db.savePrivacy(her.id, added, settings), /public family tree/);
    f.db.savePrivacy(her.id, added, { ...settings, publicConsent: true });
    const graph = publicGraph(f.db.db), record = graph.records.find((p) => p.id === added);
    assert.equal(record.role, "daughter-in-law");
    assert.equal(record.genealogyId, code);
    assert.ok(graph.edges.some((e) => e.type === "spouse" && [e.a, e.b].includes(added) && [e.a, e.b].includes("m1")));
    assert.equal(JSON.stringify(graph).includes("wife@example.test"), false, "contacts are never public");
    f.db.savePrivacy(her.id, added, { ...settings, audience: "private" });
    assert.equal(publicGraph(f.db.db).records.some((p) => p.id === added), false, "withdrawal removes her at once");
    f.db.savePrivacy(her.id, added, { ...settings, publicConsent: true });
    f.db.restrict(f.admin, added, "Synthetic safeguarding hold for testing.");
    assert.equal(publicGraph(f.db.db).records.some((p) => p.id === added), false, "a privacy hold overrides consent");
    const child = f.db.proposeRelative(f.member, { relation: "daughter", name: "Synthetic Girl", gender: "female", village: "गाँव-क", life: "child", sourceType: "family_knowledge", source: "Synthetic child of the member for testing." });
    f.db.decide(f.admin, child, "accept", "Moderator checked the synthetic child record.");
    const kidCode = f.db.one("SELECT public_code FROM people WHERE proposal_id=?", child).public_code;
    assert.equal(f.db.claimCandidates(her.id, { code: kidCode }).total, 0, "a child's code never opens a claim");
  } finally {
    f.db.close();
  }
});

test("roles are contextual on one node, and archive codes are preserved", () => {
  const dir = mkdtempSync(join(tmpdir(), "codes-")), file = join(dir, "members.sqlite");
  let db = new MemberStore(file);
  try {
    for (const [id, name, gender, legacy] of [["father", "Father", "male", "v_ii_1_1"], ["she", "Her", "female", "v_ii_2_1"], ["husband", "Husband", "male", "w_ii_2_4"], ["bride", "Bride", "female", null]])
      db.run("INSERT INTO people(id,legacy_id,name,gender,village,source,kind) VALUES(?,?,?,?,?,?,?)", id, legacy, name, gender, "Village", "Synthetic", legacy ? "archive" : "community");
    db.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES('fs','father','she','parent','father','Synthetic')");
    db.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES('sh','she','husband','spouse',NULL,'Synthetic')");
    db.run("UPDATE people SET public_code=NULL");
    db.close();
    db = new MemberStore(file); // reopening runs the additive upgrade
    const g = publicGraph(db.db), role = (id) => g.records.find((p) => p.id === id)?.role;
    assert.equal(role("she"), "daughter+daughter-in-law", "one woman, both families, one node");
    assert.equal(role("father"), null);
    assert.equal(g.records.find((p) => p.id === "she").genealogyId, "v_ii_2_1");
    assert.equal(g.records.some((p) => p.id === "bride"), false);
    assert.match(db.one("SELECT public_code FROM people WHERE id='bride'").public_code, /^LV-/, "existing member-added people receive a code on upgrade");
    assert.equal(db.one("SELECT public_code FROM people WHERE id='she'").public_code, null, "archive entries keep only their original code");
  } finally {
    db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the signed-in visual tree shows ancestors and the private family circle without unrelated private people", async () => {
  const f = await fixture();
  try {
    assert.throws(() => f.db.memberTree(f.member), (e) => e.status === 403);
    approve(f, f.admin, f.db.requestNodeClaim(f.member, { searchName: "राम कुमार", searchVillage: "गाँव-क", id: "m1", reason: "Member's own synthetic node for review.", confirm: true }));
    const p = f.db.proposeRelative(f.member, { relation: "spouse", name: "Synthetic Wife", gender: "female", village: "Synthetic Town", life: "adult", sourceType: "family_knowledge", source: "Marriage known to both synthetic families." });
    f.db.run("UPDATE proposals SET due=0");
    f.db.tick();
    const wife = f.db.one("SELECT person_id FROM proposals WHERE id=?", p).person_id;
    f.db.run("INSERT INTO people(id,name,village,source,kind) VALUES('synthetic-sibling','Synthetic Sibling','गाँव-क','Synthetic family record','archive')");
    f.db.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES('synthetic-sibling-edge','f1','synthetic-sibling','parent','father','Synthetic family record')");
    const tree = f.db.memberTree(f.member, "hidden");
    const ids = tree.records.map((r) => r.id);
    assert.equal(tree.focus, "m1", "an invisible focus falls back to the member's own node");
    for (const id of ["g1", "f1", "m1", wife, "synthetic-sibling"]) assert.ok(ids.includes(id), id);
    for (const id of ["hidden", "kid"]) assert.equal(ids.includes(id), false, id);
    const w = tree.records.find((r) => r.id === wife);
    assert.equal(w.role, "daughter-in-law");
    assert.equal(w.community, true);
    assert.equal(JSON.stringify(tree).includes("Marriage known"), false, "proposal sources are not in the tree");
  } finally {
    f.db.close();
  }
});

test("Ajay-shaped synthetic case: the owner's node is found by father and village, and a same-name woman elsewhere is never linked", async () => {
  const db = new MemberStore(":memory:");
  try {
    db.run("INSERT INTO meta VALUES('owner_setup',?)", digest("owner-code"));
    const owner = db.actor((await db.register({ username: "owner", name: "Synthetic Owner", password, code: "owner-code", adult: true, consent: true }, true)).token).id;
    // Shape mirrors the confirmed CSV rows; these are fixtures only and no real database is touched.
    for (const [id, name, village, gender] of [["गुगाहेड़ी_ii_37_3", "कर्मबीर", "गुगाहेड़ी", "male"], ["गुगाहेड़ी_ii_38_7", "अक्षय", "गुगाहेड़ी", "male"], ["गुगाहेड़ी_ii_38_8", "अजय", "गुगाहेड़ी", "male"], ["x_ii_38_1", "अजय", "अन्य-गाँव", "male"], ["ज्ञानपुर_vii_38_10", "शगुन", "ज्ञानपुर", "female"]])
      db.run("INSERT INTO people(id,legacy_id,name,gender,village,source,kind,generation) VALUES(?,?,?,?,?,?,?,?)", "legacy:" + id, id, name, gender, village, "Synthetic CSV fixture", "archive", "38");
    for (const child of ["गुगाहेड़ी_ii_38_7", "गुगाहेड़ी_ii_38_8"])
      db.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,?,?,?)", child, "legacy:गुगाहेड़ी_ii_37_3", "legacy:" + child, "parent", "father", "Synthetic CSV fixture");
    const found = db.claimCandidates(owner, { name: "अजय", village: "गुगाहेड़ी", parent: "कर्मबीर" });
    assert.deepEqual(found.candidates.map((c) => c.serial), ["गुगाहेड़ी_ii_38_8"]);
    assert.equal(found.candidates[0].father.name, "कर्मबीर");
    assert.equal(db.claimCandidates(owner, { name: "अजय", parent: "कर्मबीर" }).total, 1, "the other अजय has a different father");
    db.requestNodeClaim(owner, { searchName: "अजय", searchVillage: "गुगाहेड़ी", searchParent: "कर्मबीर", id: "legacy:गुगाहेड़ी_ii_38_8", reason: "Owner's statement: son of Karambir, brother of Akshay, Gugaheri.", confirm: true });
    const wife = { relation: "spouse", name: "डॉ. शगुन अजय लुहाच", aliases: "Dr. Shagun Ajay Luhach", gender: "female", village: "", life: "adult", sourceType: "family_knowledge", source: "Explicit statement by Ajay Luhach (husband), 13.10.2026." };
    assert.throws(() => db.proposeRelative(owner, wife), /mark it as not known/, "a blank place must be explicitly marked unknown");
    const spouse = db.proposeRelative(owner, { ...wife, villageUnknown: true });
    const payload = JSON.parse(db.one("SELECT payload FROM proposals WHERE id=?", spouse).payload);
    assert.equal(payload.existingId, "", "a new spouse entry, not the unrelated archive शगुन");
    assert.equal(payload.village, "", "unknown birth place is kept blank, never filled with the husband's village");
    assert.equal(payload.villageUnknown, true);
    db.run("UPDATE proposals SET due=0");
    db.tick();
    assert.equal(db.one("SELECT status FROM proposals WHERE id=?", spouse).status, "pending", "waits until the owner's own node is confirmed");
    const claim = db.memberState(owner).onboarding.claim;
    assert.equal(db.memberState(owner).canConfirmOwnNode, true);
    db.confirmOwnNode(owner, claim.id, { confirm: true, statement: "I am Ajay, son of Karambir and brother of Akshay, Gugaheri." });
    assert.equal(db.memberState(owner).onboarding.claim.status, "approved");
    db.run("UPDATE proposals SET due=0");
    db.tick();
    assert.equal(db.one("SELECT status FROM proposals WHERE id=?", spouse).status, "auto_accepted");
    const added = db.one("SELECT person_id FROM proposals WHERE id=?", spouse).person_id;
    assert.equal(db.person(added).village, "");
    assert.equal(db.familyFor(owner, "legacy:गुगाहेड़ी_ii_38_8").spouses[0].name, "डॉ. शगुन अजय लुहाच");
  } finally {
    db.close();
  }
});

test("only the original owner may explicitly confirm their own pending claim; everyone else keeps independent review", async () => {
  const f = await fixture();
  try {
    // A v12-style claim (no onboarding context) is recognised: no duplicate claim is demanded.
    const own = f.db.requestClaim(f.admin, "m1", "Owner's own synthetic node, submitted before onboarding.", "self");
    assert.equal(f.db.memberState(f.admin).onboarding.required, false);
    assert.equal(f.db.memberState(f.admin).onboarding.claim.id, own);
    assert.equal(f.db.memberState(f.admin).onboarding.claim.person_parent, "हरि सिंह");
    assert.throws(() => f.db.verifyClaim(f.admin, own, true, "Ordinary review path stays closed.", "family_records"), /separate reviewer/);
    assert.throws(() => f.db.confirmOwnNode(f.admin, own, { statement: "Synthetic owner statement for test." }), /Tick the confirmation/);
    assert.throws(() => f.db.confirmOwnNode(f.admin, own, { confirm: true, statement: "short" }), /15 characters/);
    // A member, and even an appointed reviewer, cannot use the owner path for their own claim.
    const memberClaim = f.db.requestNodeClaim(f.member, { searchName: "राम कुमार", searchVillage: "गाँव-ख", id: "m2", reason: "Member's own synthetic node for review.", confirm: true });
    assert.equal(f.db.memberState(f.member).canConfirmOwnNode, false);
    assert.throws(() => f.db.confirmOwnNode(f.member, memberClaim, { confirm: true, statement: "Member tries the owner path." }), (e) => e.status === 403);
    approve(f, f.admin, memberClaim);
    await f.db.appointReviewer(f.admin, f.member, password, "Synthetic reviewer for this owner-path test.");
    assert.throws(() => f.db.confirmOwnNode(f.member, own, { confirm: true, statement: "Reviewer tries to confirm the owner's claim." }), (e) => e.status === 403);
    f.db.confirmOwnNode(f.admin, own, { confirm: true, statement: "I am the owner; this is my own synthetic entry." });
    assert.equal(f.db.one("SELECT status FROM claims WHERE id=?", own).status, "approved");
    assert.equal(f.db.one("SELECT method,reviewer FROM verification_details WHERE claim_id=?", own).method, "owner_self_confirmation");
    const audit = f.db.one("SELECT detail FROM audit WHERE action='owner_self_node_confirmed'");
    assert.match(audit.detail, /this is my own synthetic entry/);
    assert.throws(() => f.db.confirmOwnNode(f.admin, own, { confirm: true, statement: "Confirming the same claim twice." }), /no longer pending/);
  } finally {
    f.db.close();
  }
});

test("hosted deployment never creates a fresh member database for a missing path; diagnostics expose no paths", () => {
  const dir = mkdtempSync(join(tmpdir(), "storage-"));
  try {
    assert.throws(() => memberDbPath({ LUHACH_DEPLOYMENT: "test" }), (e) => e.status === 503);
    assert.throws(() => memberDbPath({ LUHACH_DEPLOYMENT: "test", LUHACH_MEMBER_DB: "data/members.sqlite" }), (e) => e.status === 503);
    assert.throws(() => memberDbPath({ LUHACH_DEPLOYMENT: "test", LUHACH_MEMBER_DB: join(dir, "moved.sqlite") }), (e) => e.status === 503);
    const file = join(dir, "members.sqlite");
    const db = new MemberStore(file);
    db.run("CREATE TABLE legacy_records(source_table TEXT,source_id TEXT,payload TEXT)");
    db.run("INSERT INTO legacy_records VALUES('village','1','{}')");
    db.close();
    writeFileSync(join(dir, "heritage-en.json"), "{}");
    assert.equal(memberDbPath({ LUHACH_DEPLOYMENT: "test", LUHACH_MEMBER_DB: file }), file);
    const checks = storageDiagnostics({ LUHACH_DEPLOYMENT: "test", LUHACH_MEMBER_DB: file });
    assert.equal(checks.legacyTables, true);
    assert.equal(checks.content.village, 1);
    assert.equal(checks.translations, true);
    assert.equal(checks.accountsPresent, false);
    assert.equal(JSON.stringify(checks).includes(dir.replaceAll("\\", "\\\\")), false);
    assert.equal(storageDiagnostics({ LUHACH_DEPLOYMENT: "test", LUHACH_MEMBER_DB: join(dir, "moved.sqlite") }).memberDbExists, false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
