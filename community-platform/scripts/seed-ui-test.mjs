import { MemberStore } from "../lib/members.mjs";
import { createHash } from "node:crypto";
import { writeFileSync } from "node:fs";
const db = new MemberStore("data/members-ui-test.sqlite");
if (db.one("SELECT account_id FROM credentials LIMIT 1")) {
  console.log("Existing synthetic UI database retained.");
  db.close();
  process.exit(0);
}
db.run(
  "INSERT INTO meta VALUES('owner_setup',?)",
  createHash("sha256").update("ui-test-owner").digest("hex"),
);
const password = "Only for synthetic local UI tests 2026";
const owner = await db.register(
  {
    username: "qa.owner",
    name: "Test Administrator",
    password,
    code: "ui-test-owner",
    adult: true,
    consent: true,
  },
  true,
);
const admin = db.actor(owner.token).id;
const member = await db.register({
  username: "qa.member",
  name: "Ananya · test member",
  password,
  code: db.invite(admin, "Ananya test only").code,
  adult: true,
  consent: true,
});
const id = db.actor(member.token).id;
const profile = db.createProfile(id, {
  name: "Ananya Luhach · fictional test",
  village: "Nandha · test",
  reason:
    "Fictional test profile. Family reviewer can verify this sample connection.",
});
db.run("DELETE FROM member_sessions");
db.close();
console.log("Synthetic UI database created; no real account configured.");
