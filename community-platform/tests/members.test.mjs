import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { MemberStore } from "../lib/members.mjs";
const digest = (s) => createHash("sha256").update(s).digest("hex");
const password = "Synthetic test phrase 2026 only";
async function fixture() {
  const db = new MemberStore(":memory:");
  db.run("INSERT INTO meta VALUES('owner_setup',?)", digest("test-owner-code"));
  const owner = await db.register(
    {
      username: "owner",
      name: "Test Owner",
      password,
      code: "test-owner-code",
      adult: true,
      consent: true,
    },
    true,
  );
  const admin = db.actor(owner.token).id;
  const invite = db.invite(admin, "Test member");
  const user = await db.register({
    username: "member",
    name: "Test Member",
    password,
    code: invite.code,
    adult: true,
    consent: true,
  });
  const member = db.actor(user.token).id;
  db.run(
    "INSERT INTO people(id,name,village,source,kind) VALUES('archive-a','Test Ancestor','Test Village','Synthetic archive','archive')",
  );
  db.run(
    "INSERT INTO people(id,name,village,source,kind) VALUES('archive-b','Test Parent','Test Village','Synthetic archive','archive')",
  );
  db.run(
    "INSERT INTO relationships(id,a,b,type,source) VALUES('test-edge','archive-b','archive-a','parent','Synthetic archive')",
  );
  return { db, admin, member, user, owner, invite };
}
function verified(f) {
  const claim = f.db.requestClaim(
    f.member,
    "archive-a",
    "My family connection checked with a trusted relative.",
    "self",
  );
  f.db.verifyClaim(
    f.admin,
    claim,
    true,
    "Checked this family against the test source.",
    "family_records",
  );
  return claim;
}
const privateSettings = {
  life: "adult",
  audience: "private",
  contactAudience: "private",
  email: "private@example.test",
  phone: "555-test",
  city: "Test City",
};
test("bilingual account introductions stay private even from reviewers and genealogy search", async () => {
  const f = await fixture();
  try {
    const copy = { about_hi: "मेरा निजी परिचय", about_en: "Private introduction", family_hi: "परिवार का निजी परिचय", family_en: "Private family introduction" };
    f.db.saveIntroduction(f.member, copy);
    assert.equal(f.db.memberState(f.member).introduction.about_hi, copy.about_hi);
    assert.equal(f.db.memberState(f.admin).introduction, undefined);
    assert.equal(f.db.searchFor(f.admin, "Private introduction").length, 0);
    assert.throws(() => f.db.saveIntroduction("missing-account", copy));
    assert.throws(() => f.db.saveIntroduction(f.member, {...copy, about_en: "x".repeat(3001)}), /3000/);
    assert.throws(() => f.db.saveIntroduction(f.member, {...copy, family_en: {text: "unsafe"}}), /3000/);
    assert.equal(f.db.memberState(f.member).introduction.about_en, copy.about_en);
    assert.equal(f.db.one("SELECT COUNT(*) AS n FROM claims").n, 0);
    assert.equal(f.db.one("SELECT detail FROM audit WHERE action='private_introduction_saved'").detail.includes(copy.about_en), false);
    f.db.saveIntroduction(f.member, {...copy, about_en: ""});
    assert.equal(f.db.memberState(f.member).introduction.about_en, "");
  } finally { f.db.close(); }
});
test("real accounts have no persona login; bootstrap is one-time and invitations expire or revoke", async () => {
  const f = await fixture();
  try {
    assert.throws(() => f.db.login("admin"), /Sample accounts/);
    await assert.rejects(
      () =>
        f.db.register(
          {
            username: "second",
            name: "Second",
            password,
            code: "test-owner-code",
            adult: true,
            consent: true,
          },
          true,
        ),
      /complete/,
    );
    await assert.rejects(
      () =>
        f.db.register({
          username: "second",
          name: "Second",
          password,
          code: f.invite.code,
          adult: true,
          consent: true,
        }),
      /already used/,
    );
    const inv = f.db.invite(f.admin, "Expired test");
    f.db.run("UPDATE invitations SET expires=0 WHERE hash=?", digest(inv.code));
    await assert.rejects(
      () =>
        f.db.register({
          username: "second",
          name: "Second",
          password,
          code: inv.code,
          adult: true,
          consent: true,
        }),
      /expired/,
    );
    const revoked = f.db.invite(f.admin, "Revoked test");
    f.db.revokeInvite(f.admin, digest(revoked.code));
    await assert.rejects(
      () =>
        f.db.register({
          username: "second",
          name: "Second",
          password,
          code: revoked.code,
          adult: true,
          consent: true,
        }),
      /invalid/,
    );
  } finally {
    f.db.close();
  }
});
test("passwords are salted hashes; opaque sessions logout, idle expiry and absolute expiry work", async () => {
  const f = await fixture();
  try {
    const c = f.db.one(
      "SELECT * FROM credentials WHERE account_id=?",
      f.member,
    );
    assert(!c.password_hash.includes(password));
    assert(!c.recovery_hash.includes(f.user.recovery));
    await assert.rejects(
      () => f.db.authenticate("member", "bad password"),
      /incorrect/,
    );
    const s = await f.db.authenticate("member", password);
    assert(f.db.actor(s.token));
    f.db.logout(s.token);
    assert.equal(f.db.actor(s.token), null);
    f.db.run(
      "UPDATE member_sessions SET last_seen=0 WHERE account_id=?",
      f.member,
    );
    assert.equal(f.db.actor(f.user.token), null);
    const t = f.db.session(f.member);
    f.db.run(
      "UPDATE member_sessions SET expires=0 WHERE account_id=?",
      f.member,
    );
    assert.equal(f.db.actor(t), null);
  } finally {
    f.db.close();
  }
});
test("recovery codes are single-use, rotate and invalidate all old sessions", async () => {
  const f = await fixture();
  try {
    const recovered = await f.db.recover(
      "member",
      f.user.recovery,
      "Replacement synthetic phrase 2026",
    );
    assert.equal(f.db.actor(f.user.token), null);
    assert(f.db.actor(recovered.token));
    await assert.rejects(
      () => f.db.recover("member", f.user.recovery, password),
      /incorrect/,
    );
    await assert.rejects(
      () => f.db.authenticate("member", password),
      /incorrect/,
    );
    assert(
      await f.db.authenticate("member", "Replacement synthetic phrase 2026"),
    );
  } finally {
    f.db.close();
  }
});
test("login throttling survives store calls and applies to unknown identities", async () => {
  const f = await fixture();
  try {
    for (let i = 0; i < 6; i++)
      await assert.rejects(
        () => f.db.authenticate("missing", "wrong"),
        /incorrect/,
      );
    await assert.rejects(
      () => f.db.authenticate("missing", "wrong"),
      (e) => e.status === 429,
    );
  } finally {
    f.db.close();
  }
});
test("unverified invitee only gets minimal archival lookup; graph, notes, private entries blocked", async () => {
  const f = await fixture();
  try {
    assert.equal(f.db.searchFor(f.member, "").length, 0);
    const rows = f.db.searchFor(f.member, "Ancestor");
    assert.deepEqual(Object.keys(rows[0]).sort(), [
      "claimOnly",
      "id",
      "kind",
      "name",
      "village",
    ]);
    assert.throws(
      () => f.db.familyFor(f.member, "archive-a"),
      (e) => e.status === 404,
    );
    f.db.restrict(
      f.admin,
      "archive-a",
      "A privacy concern requires restriction.",
    );
    assert.equal(f.db.searchFor(f.member, "Ancestor").length, 0);
    assert.throws(
      () =>
        f.db.requestClaim(
          f.member,
          "archive-a",
          "Attempt to claim a hidden record.",
          "self",
        ),
      (e) => e.status === 404,
    );
  } finally {
    f.db.close();
  }
});
test("claims require independent admin with evidence; verification never times out to approval", async () => {
  const f = await fixture();
  try {
    const claim = f.db.requestClaim(
      f.member,
      "archive-a",
      "Trusted relative can confirm this family.",
      "self",
    );
    assert.throws(
      () =>
        f.db.verifyClaim(
          f.member,
          claim,
          true,
          "Please approve my own profile",
          "family_records",
        ),
      (e) => e.status === 403,
    );
    f.db.run("UPDATE claims SET created=0 WHERE id=?", claim);
    f.db.tick();
    assert.equal(
      f.db.one("SELECT status FROM claims WHERE id=?", claim).status,
      "pending",
    );
    f.db.verifyClaim(
      f.admin,
      claim,
      true,
      "Checked against the synthetic family record.",
      "family_records",
    );
    assert(f.db.verified(f.member));
    assert(f.db.familyFor(f.member, "archive-a"));
    assert.equal(
      f.db.one(
        "SELECT method FROM verification_details WHERE claim_id=?",
        claim,
      ).method,
      "family_records",
    );
  } finally {
    f.db.close();
  }
});
test("private profile and graph edges do not leak to another verified member; contact sharing is explicit", async () => {
  const f = await fixture();
  try {
    verified(f);
    const invite = f.db.invite(f.admin, "Other tester");
    const r = await f.db.register({
      username: "other",
      name: "Other Tester",
      password,
      code: invite.code,
      adult: true,
      consent: true,
    });
    const other = f.db.actor(r.token).id;
    f.db.run("UPDATE credentials SET verified=1 WHERE account_id=?", other);
    f.db.savePrivacy(f.member, "archive-a", privateSettings);
    assert.equal(f.db.searchFor(other, "Ancestor").length, 0);
    assert.equal(f.db.familyFor(other, "archive-b").children.length, 0);
    assert.throws(
      () => f.db.familyFor(other, "archive-a"),
      (e) => e.status === 404,
    );
    assert(f.db.familyFor(f.member, "archive-a").person.contact.email);
    f.db.savePrivacy(f.member, "archive-a", {
      ...privateSettings,
      audience: "verified",
      profileConsent: true,
    });
    assert.equal(f.db.familyFor(other, "archive-a").person.contact, undefined);
    f.db.savePrivacy(f.member, "archive-a", {
      ...privateSettings,
      audience: "verified",
      profileConsent: true,
      contactAudience: "verified",
      contactConsent: true,
    });
    assert.equal(
      f.db.familyFor(other, "archive-a").person.contact.email,
      "private@example.test",
    );
    f.db.savePrivacy(f.member, "archive-a", privateSettings);
    assert.throws(
      () => f.db.familyFor(other, "archive-a"),
      (e) => e.status === 404,
    );
  } finally {
    f.db.close();
  }
});
test("relative stewardship cannot publish contacts; children cannot be made visible or silently become adults", async () => {
  const f = await fixture();
  try {
    const c = f.db.requestClaim(
      f.member,
      "archive-a",
      "I help this family member maintain records.",
      "relative",
    );
    f.db.verifyClaim(
      f.admin,
      c,
      true,
      "Connection checked with the family.",
      "contacted_member",
    );
    assert.throws(
      () => f.db.savePrivacy(f.member, "archive-a", privateSettings),
      (e) => e.status === 403,
    );
    const g = f.db.requestClaim(
      f.member,
      "archive-b",
      "I am the parent and can verify this child.",
      "guardian",
    );
    f.db.verifyClaim(
      f.admin,
      g,
      true,
      "Guardian checked through family conversation.",
      "contacted_member",
    );
    f.db.savePrivacy(f.member, "archive-b", {
      ...privateSettings,
      life: "child",
    });
    assert.throws(
      () =>
        f.db.savePrivacy(f.member, "archive-b", {
          ...privateSettings,
          life: "child",
          audience: "verified",
          profileConsent: true,
        }),
      /Children remain private/,
    );
    assert.throws(
      () => f.db.savePrivacy(f.member, "archive-b", privateSettings),
      /child-to-adult/,
    );
    assert.throws(
      () => f.db.savePrivacy(f.admin, "archive-a", privateSettings),
      (e) => e.status === 403,
    );
  } finally {
    f.db.close();
  }
});
test("new self profiles start private and only their author/admin can read pending verification", async () => {
  const f = await fixture();
  try {
    const id = f.db.createProfile(f.member, {
      name: "Private Test Person",
      village: "Test Village",
      reason: "My parent is known to the family reviewer.",
    });
    assert.equal(f.db.privacy(id).audience, "private");
    assert.equal(f.db.memberState(f.member).claims.length, 1);
    const claim = f.db.one("SELECT id FROM claims WHERE person_id=?", id);
    f.db.verifyClaim(
      f.admin,
      claim.id,
      true,
      "Family connection checked by conversation.",
      "contacted_member",
    );
    assert.equal(f.db.memberState(f.member).own[0].id, id);
  } finally {
    f.db.close();
  }
});
test("unrelated verified members cannot read proposal sources, claim reasons or inboxes", async () => {
  const f = await fixture();
  try {
    verified(f);
    const r = await f.db.register({
      username: "other",
      name: "Other Tester",
      password,
      code: f.db.invite(f.admin, "Other").code,
      adult: true,
      consent: true,
    });
    const other = f.db.actor(r.token).id;
    f.db.run("UPDATE credentials SET verified=1 WHERE account_id=?", other);
    const p = f.db.propose(f.member, "archive-a", {
      relation: "daughter",
      name: "Test Daughter",
      gender: "female",
      village: "Test Village",
      source: "Private proposal source belonging to author.",
    });
    const s = f.db.memberState(other);
    assert.equal(s.claims.length, 0);
    assert.equal(s.proposals.length, 0);
    assert.equal(s.notifications.length, 0);
    assert.equal(s.audit.length, 0);
    assert.throws(
      () =>
        f.db.object(other, p, "This unrelated viewer cannot read proposal."),
      (e) => e.status === 404,
    );
  } finally {
    f.db.close();
  }
});
test("revocation immediately invalidates sessions and stewardship; member cannot invite or revoke", async () => {
  const f = await fixture();
  try {
    verified(f);
    assert.throws(
      () => f.db.invite(f.member, "Intruder"),
      (e) => e.status === 403,
    );
    assert.throws(
      () =>
        f.db.revokeVerification(
          f.member,
          f.admin,
          "Trying to revoke the administrator.",
        ),
      (e) => e.status === 403,
    );
    f.db.revokeVerification(
      f.admin,
      f.member,
      "Family verification was found to be mistaken.",
    );
    assert.equal(f.db.actor(f.user.token), null);
    assert.equal(f.db.verified(f.member), false);
    assert.equal(f.db.owns(f.member, "archive-a"), false);
    assert.throws(
      () => f.db.familyFor(f.member, "archive-a"),
      (e) => e.status === 404,
    );
  } finally {
    f.db.close();
  }
});

test("password changes rotate recovery and invalidate prior sessions", async () => {
  const f = await fixture();
  try {
    await assert.rejects(
      () => f.db.changePassword(f.member, "wrong", password),
      /incorrect/,
    );
    const changed = await f.db.changePassword(
      f.member,
      password,
      "Changed synthetic phrase for test 2026",
    );
    assert.equal(f.db.actor(f.user.token), null);
    assert(f.db.actor(changed.token));
    await assert.rejects(
      () => f.db.recover("member", f.user.recovery, password),
      /incorrect/,
    );
    assert(
      await f.db.authenticate(
        "member",
        "Changed synthetic phrase for test 2026",
      ),
    );
  } finally {
    f.db.close();
  }
});
test("reviewer appointment requires verified target, admin password and independent actor", async () => {
  const f = await fixture();
  try {
    await assert.rejects(
      () =>
        f.db.appointReviewer(
          f.admin,
          f.member,
          password,
          "Trusted reviewer for this test branch.",
        ),
      /Verify the member/,
    );
    verified(f);
    await assert.rejects(
      () =>
        f.db.appointReviewer(
          f.admin,
          f.member,
          "incorrect",
          "Trusted reviewer for this test branch.",
        ),
      /password/,
    );
    await f.db.appointReviewer(
      f.admin,
      f.member,
      password,
      "Trusted reviewer for this test branch.",
    );
    assert.equal(f.db.user(f.member).role, "admin");
    assert.equal(f.db.actor(f.user.token), null);
    await assert.rejects(
      () =>
        f.db.appointReviewer(
          f.admin,
          f.admin,
          password,
          "Attempt to change own administrator access.",
        ),
      /own administrator/,
    );
  } finally {
    f.db.close();
  }
});
test("accepted private addition can request guardian stewardship without becoming visible to all", async () => {
  const f = await fixture();
  try {
    verified(f);
    const id = f.db.propose(f.member, "archive-a", {
      relation: "daughter",
      name: "Test Daughter",
      gender: "female",
      village: "Test Village",
      source: "Trusted fictional family record confirms this daughter.",
    });
    f.db.decide(
      f.admin,
      id,
      "accept",
      "Family connection checked for this synthetic test.",
    );
    const p = f.db.one("SELECT person_id FROM proposals WHERE id=?", id);
    assert.equal(f.db.privacy(p.person_id).audience, "private");
    const claim = f.db.requestClaim(
      f.member,
      p.person_id,
      "I am the parent of this fictional child.",
      "guardian",
    );
    f.db.verifyClaim(
      f.admin,
      claim,
      true,
      "Guardian connection checked against the family record.",
      "family_records",
    );
    assert.equal(f.db.privacy(p.person_id).life, "child");
    assert.equal(f.db.privacy(p.person_id).audience, "private");
  } finally {
    f.db.close();
  }
});

test("privacy hold survives member settings and release does not turn sharing on", async () => {
  const f = await fixture();
  try {
    verified(f);
    f.db.restrict(
      f.admin,
      "archive-a",
      "A privacy concern requires investigation.",
    );
    assert.throws(
      () =>
        f.db.savePrivacy(f.member, "archive-a", {
          ...privateSettings,
          audience: "verified",
          profileConsent: true,
        }),
      /privacy hold/,
    );
    f.db.releaseRestriction(
      f.admin,
      "archive-a",
      "Concern resolved with the member directly.",
    );
    assert.equal(f.db.privacy("archive-a").audience, "private");
    f.db.savePrivacy(f.member, "archive-a", {
      ...privateSettings,
      audience: "verified",
      profileConsent: true,
    });
    assert.equal(f.db.privacy("archive-a").audience, "verified");
  } finally {
    f.db.close();
  }
});
