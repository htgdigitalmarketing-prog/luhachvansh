import test from "node:test";
import assert from "node:assert/strict";
import { HubStore } from "../lib/hub.mjs";
import { retrieve, answerFamily } from "../lib/research.mjs";
import { createHash } from 'node:crypto';
function fixture() {
  const db = new HubStore(":memory:");
  for (const id of ["admin", "alice", "bob", "eve"]) {
    db.run(
      "INSERT INTO accounts VALUES(?,?,?)",
      id,
      id,
      id === "admin" ? "admin" : "member",
    );
    db.run(
      "INSERT INTO credentials VALUES(?,?,?,?,?,?)",
      id,
      id,
      "unused-test-hash",
      "unused-recovery-" + id,
      1,
      Date.now(),
    );
    db.run(
      "INSERT INTO people(id,name,village,source,kind) VALUES(?,?,?,'Synthetic test record','community')",
      id + "-p",
      id + " test",
      "Test village",
    );
    db.run(
      "INSERT INTO claims VALUES(?,?,?,'Synthetic claim','approved',?,NULL)",
      id + "-claim",
      id,
      id + "-p",
      Date.now(),
    );
    db.run(
      "INSERT INTO verification_details VALUES(?, 'self','family_records','admin',?)",
      id + "-claim",
      Date.now(),
    );
    db.run(
      "INSERT INTO profile_privacy VALUES(?,'verified','adult','private','','','',?)",
      id + "-p",
      Date.now(),
    );
  }
  return db;
}
const entry = {
  kind: "village",
  title: "A test village memory",
  village: "Test village",
  body: "An illustrative contribution, not a historical claim.",
  source: "Synthetic test fixture written for this test.",
  consent: true,
};
const dir = {
  enabled: true,
  consent: true,
  city: "Jaipur",
  state: "Rajasthan",
  country: "India",
};
test("archive objections pause auto acceptance; independent review records decisions", () => {
  const d = fixture();
  try {
    const { id } = d.contribute("alice", entry);
    d.run("UPDATE contributions SET due=? WHERE id=?", Date.now() - 1, id);
    d.reviewContent("bob", {
      id,
      action: "objectContent",
      reason: "This memory needs its original source.",
    });
    d.tick();
    assert.equal(
      d.one("SELECT status FROM contributions WHERE id=?", id).status,
      "disputed",
    );
    d.reviewContent("admin", {
      id,
      action: "reviewContent",
      status: "accepted",
      reason: "Original source reviewed; demonstration only.",
    });
    assert.equal(d.content("bob")[0].status, "accepted");
    const own = d.contribute("admin", entry);
    assert.throws(
      () =>
        d.reviewContent("admin", {
          id: own.id,
          action: "reviewContent",
          status: "accepted",
          reason: "Trying to approve my own contribution",
        }),
      /Another administrator/,
    );
  } finally {
    d.close();
  }
});
test("unopposed submissions accept only after deadline, child/private biographies stay hidden", () => {
  const d = fixture();
  try {
    const { id } = d.contribute("alice", entry);
    d.tick();
    assert.equal(
      d.one("SELECT status FROM contributions WHERE id=?", id).status,
      "pending",
    );
    d.run("UPDATE contributions SET due=? WHERE id=?", Date.now() - 1, id);
    d.tick();
    assert.equal(
      d.one("SELECT status FROM contributions WHERE id=?", id).status,
      "accepted",
    );
    d.run(
      "UPDATE profile_privacy SET audience='private' WHERE person_id='alice-p'",
    );
    const bio = d.contribute("alice", {
      ...entry,
      kind: "biography",
      person_id: "alice-p",
    });
    assert.ok(!d.content("bob").some((c) => c.id === bio.id));
    d.run("UPDATE profile_privacy SET life='child' WHERE person_id='alice-p'");
    assert.throws(
      () =>
        d.contribute("alice", {
          ...entry,
          kind: "biography",
          person_id: "alice-p",
        }),
      /Children/,
    );
  } finally {
    d.close();
  }
});
test("directory is opt-in and privacy withdrawal removes search and pauses messaging", () => {
  const d = fixture();
  try {
    assert.deepEqual(d.findMembers("bob"), []);
    d.saveDirectory("alice", { ...dir, person_id: "alice-p" });
    d.saveDirectory("bob", { ...dir, person_id: "bob-p" });
    assert.equal(d.findMembers("bob", "Jaipur").length, 1);
    assert.ok(!JSON.stringify(d.findMembers("bob")).includes("phone"));
    d.connect("bob", {
      target: "alice",
      note: "Hello, I am visiting this city soon.",
    });
    const c = d.one("SELECT * FROM connections");
    assert.throws(
      () => d.sendMessage("bob", { id: c.id, body: "Before consent" }),
      /not available/,
    );
    assert.throws(
      () => d.decideConnection("bob", { id: c.id, status: "accepted" }),
      /recipient/,
    );
    d.decideConnection("alice", { id: c.id, status: "accepted" });
    d.sendMessage("bob", { id: c.id, body: "Hello after consent" });
    assert.equal(d.conversations("alice")[0].messages.length, 1);
    assert.throws(() => d.connection("eve", c.id), /unavailable/);
    d.saveDirectory("alice", { enabled: false });
    assert.equal(d.findMembers("bob").length, 0);
    assert.equal(d.conversations("bob")[0].messages.length, 0);
    assert.throws(
      () => d.sendMessage("bob", { id: c.id, body: "Must not send" }),
      /not available/,
    );
  } finally {
    d.close();
  }
});
test("blocking closes chat and reports reveal only selected message to administrators", () => {
  const d = fixture();
  try {
    for (const a of ["alice", "bob"])
      d.saveDirectory(a, { ...dir, person_id: a + "-p" });
    d.connect("alice", {
      target: "bob",
      note: "Please connect for our local community.",
    });
    const c = d.one("SELECT * FROM connections");
    d.decideConnection("bob", { id: c.id, status: "accepted" });
    d.sendMessage("alice", { id: c.id, body: "Reported test message" });
    d.sendMessage("bob", { id: c.id, body: "Unreported private reply" });
    const m = d.one("SELECT * FROM messages WHERE sender=?", "alice");
    d.report("bob", {
      id: c.id,
      message_id: m.id,
      reason: "Test report of this specific message.",
    });
    assert.equal(d.reportsFor("admin")[0].reported_message, m.body);
    assert.ok(
      !JSON.stringify(d.reportsFor("admin")).includes(
        "Unreported private reply",
      ),
    );
    assert.deepEqual(d.conversations("admin"), []);
    d.block("bob", "alice");
    assert.equal(d.findMembers("bob").length, 0);
    assert.equal(d.conversations("alice")[0].status, "closed");
    d.block("bob", "alice", false);
    assert.equal(d.conversations("alice")[0].status, "closed");
  } finally {
    d.close();
  }
});
test("lineage paths do not traverse a hidden intermediate person", () => {
  const d = fixture();
  try {
    for (const [id, a, b] of [
      ["ab", "alice-p", "bob-p"],
      ["be", "bob-p", "eve-p"],
    ])
      d.run(
        "INSERT INTO relationships(id,a,b,type,role,source) VALUES(?,?,?,'parent','mother','Synthetic family fixture')",
        id,
        a,
        b,
      );
    assert.equal(d.lineage("eve", "alice-p", "eve-p").steps.length, 2);
    d.run(
      "UPDATE profile_privacy SET audience='private' WHERE person_id='bob-p'",
    );
    assert.equal(d.lineage("eve", "alice-p", "eve-p").found, false);
    assert.equal(d.lineage("admin", "alice-p", "eve-p").found, true);
  } finally {
    d.close();
  }
});
test("independent stewardship transfer makes sharing private and promotes child to adult only on self review", () => {
  const d = fixture();
  try {
    d.run(
      "UPDATE profile_privacy SET life='child',audience='private' WHERE person_id='alice-p'",
    );
    d.requestTransfer("alice", {
      claim: "alice-claim",
      target: "bob",
      reason:
        "The person has reached adulthood and consents to managing their profile.",
    });
    const t = d.one("SELECT * FROM transfers");
    assert.throws(
      () =>
        d.reviewTransfer("alice", {
          id: t.id,
          accept: true,
          relationship: "self",
          reason: "Attempt by original steward",
        }),
      /Administrator/,
    );
    d.reviewTransfer("admin", {
      id: t.id,
      accept: true,
      relationship: "self",
      reason: "Age and consent checked independently in this test.",
    });
    assert.equal(d.privacy("alice-p").life, "adult");
    assert.equal(d.privacy("alice-p").audience, "private");
    assert.ok(d.selfClaim("bob", "alice-p"));
    assert.equal(d.owns("alice", "alice-p"), false);
  } finally {
    d.close();
  }
});
test("research retrieval returns original source IDs and no invented match", () => {
  assert.equal(retrieve("zzzxxyy-no-such-phrase").length, 0);
  const passages = retrieve("गाँव", "अमरपुर");
  assert.ok(passages.length);
  assert.ok(
    passages.every(
      (p) =>
        p.source.startsWith("https://luhachvansh.com/") &&
        p.id.startsWith("अमरपुर:"),
    ),
  );
});
test('family assistant answers locally and does not expose hidden mothers',()=>{const d=fixture();try{d.run("INSERT INTO relationships(id,a,b,type,role,source) VALUES('mother','alice-p','bob-p','parent','mother','Synthetic source')");assert.match(answerFamily(d,'eve',{person:'bob-p',question:'Who is the mother?'}).answer,/alice test/);d.run("UPDATE profile_privacy SET audience='private' WHERE person_id='alice-p'");assert.doesNotMatch(answerFamily(d,'eve',{person:'bob-p',question:'Who is the mother?'}).answer,/alice test/);}finally{d.close();}});
test('relationship tracing does not disclose private contribution evidence to unrelated members',()=>{const d=fixture();try{d.run("INSERT INTO relationships(id,a,b,type,source,proposal_id) VALUES('sensitive','alice-p','bob-p','spouse','Private evidence with contact details','test-proposal')");assert.doesNotMatch(JSON.stringify(d.lineage('eve','alice-p','bob-p')),/Private evidence with contact/);assert.match(JSON.stringify(d.lineage('alice','alice-p','bob-p')),/Private evidence with contact/);}finally{d.close();}});
test('administrator removal rechecks authority after password confirmation',async()=>{const d=fixture();try{d.run("UPDATE accounts SET role='admin' WHERE id='bob'");d.authenticate=async()=>{d.run("UPDATE accounts SET role='member' WHERE id='admin'");return{};};await assert.rejects(d.demoteAdmin('admin',{target:'bob',password:'test',reason:'A simultaneous administrator role change.'}),/Administrator access/);assert.equal(d.user('bob').role,'admin');}finally{d.close();}});
test('account closure revokes authentication and hides archival profiles even without prior settings',async()=>{const d=new HubStore(':memory:'),password='Synthetic closure test password 2026';try{d.run("INSERT INTO meta VALUES('owner_setup',?)",createHash('sha256').update('setup').digest('hex'));const owner=await d.register({username:'owner',name:'Owner',password,code:'setup',adult:true,consent:true},true),admin=d.actor(owner.token).id;const login=await d.register({username:'closing',name:'Closing Member',password,code:d.invite(admin,'Closure test').code,adult:true,consent:true}),a=d.actor(login.token).id;d.run("INSERT INTO people(id,name,kind,source) VALUES('archive','Test historical profile','archive','Synthetic test')");const claim=d.requestClaim(a,'archive','This synthetic person is my test profile.','self');d.verifyClaim(admin,claim,true,'Verified against the fictional test fixture.','family_records');assert.equal(d.privacy('archive').audience,'verified');const data=d.exportAccount(admin);assert.equal(data.account.members,undefined);assert.equal(data.account.audit,undefined);assert.doesNotMatch(JSON.stringify(data),/password_hash|recovery_hash/);await assert.rejects(d.closeAccount(admin,password),/administrator duties/);await d.closeAccount(a,password);assert.equal(d.actor(login.token),null);assert.equal(d.privacy('archive').audience,'private');assert.equal(d.one('SELECT account_id FROM credentials WHERE account_id=?',a),undefined);assert.equal(d.one('SELECT status FROM claims WHERE id=?',claim).status,'revoked');}finally{d.close();}});
