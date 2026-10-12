import { randomBytes, createHash } from "node:crypto";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { MemberStore } from "../lib/members.mjs";
import { DatabaseSync } from "node:sqlite";
import { resolve, dirname } from "node:path";
const databasePath = process.env.LUHACH_MEMBER_DB || resolve("data/members.sqlite");
const setupPath = process.env.LUHACH_MEMBER_DB
  ? resolve(databasePath + ".owner-setup.txt")
  : resolve("data/OWNER-SETUP.txt");
const db = new MemberStore(databasePath);
// Copy only archive records; never copy the sample accounts, sessions or review clock.
if (
  !db.one("SELECT id FROM people LIMIT 1") &&
  existsSync("data/community.sqlite")
) {
  const source = new DatabaseSync("data/community.sqlite", { readOnly: true });
  const people = source
    .prepare("SELECT * FROM people WHERE kind='archive'")
    .all();
  const ids = new Set(people.map((p) => p.id));
  db.transaction(() => {
    for (const p of people) {
      const cols = Object.keys(p);
      db.run(
        `INSERT INTO people(${cols.join(",")}) VALUES(${cols.map(() => "?").join(",")})`,
        ...Object.values(p),
      );
    }
    for (const r of source
      .prepare("SELECT * FROM relationships WHERE active=1")
      .all()) {
      if (!ids.has(r.a) || !ids.has(r.b)) continue;
      const cols = Object.keys(r);
      db.run(
        `INSERT INTO relationships(${cols.join(",")}) VALUES(${cols.map(() => "?").join(",")})`,
        ...Object.values(r),
      );
    }
    for (const i of source.prepare("SELECT * FROM imports").all())
      db.run(
        "INSERT INTO imports VALUES(?,?,?,?)",
        i.hash,
        i.filename,
        i.count,
        i.created,
      );
  });
  source.close();
  console.log(
    `Copied ${people.length} historical records into isolated member database.`,
  );
}
if (db.one("SELECT account_id FROM credentials LIMIT 1"))
  console.log("Owner already configured; no setup code generated.");
else if (
  db.one("SELECT value FROM meta WHERE key='owner_setup'") &&
  existsSync(setupPath)
)
  console.log(`Existing owner setup file retained: ${setupPath}`);
else {
  const code = randomBytes(32).toString("base64url");
  db.run(
    "INSERT OR REPLACE INTO meta VALUES('owner_setup',?)",
    createHash("sha256").update(code).digest("hex"),
  );
  mkdirSync(dirname(setupPath), { recursive: true });
  writeFileSync(
    setupPath,
    `Private one-time owner setup code\n\n${code}\n\nOpen http://127.0.0.1:3020/members and choose Set up owner. Enter this code and choose your own username and password. The code stops working after setup. Never upload this file.\n`,
  );
  console.log(
    `Owner setup file prepared: ${setupPath} (contents not printed).`,
  );
}
db.close();
