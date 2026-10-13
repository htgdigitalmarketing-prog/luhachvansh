import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { resolve, join, dirname } from "node:path";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  createHash,
} from "node:crypto";
import { backup, DatabaseSync } from "node:sqlite";
import { getHub, mediaRoot } from "../lib/hub.mjs";
const keyPath = process.env.LUHACH_BACKUP_KEY || resolve(dirname(process.env.LUHACH_MEMBER_DB || resolve("data/members.sqlite")),"BACKUP-KEY.txt");
mkdirSync(dirname(keyPath), {recursive:true});
mkdirSync("data", { recursive: true });
mkdirSync("backups", { recursive: true });
if (!existsSync(keyPath))
  writeFileSync(keyPath, randomBytes(32).toString("hex"), { flag: "wx" });
const key = Buffer.from(readFileSync(keyPath, "utf8").trim(), "hex");
if (key.length !== 32) throw Error("Backup key must be 32 bytes.");
const stamp = new Date().toISOString().replaceAll(":", "-"),
  store = getHub(),
  snapshot = resolve("backups", `snapshot-${stamp}.sqlite`);
await backup(store.db, snapshot);
store.close();
// Sessions and unused owner setup/invitation credentials are intentionally excluded from portable backups.
const portable = new DatabaseSync(snapshot);
portable.exec(
  "DELETE FROM member_sessions; DELETE FROM sessions; DELETE FROM invitations; DELETE FROM meta WHERE key='owner_setup';",
);
portable.close();
const media = existsSync(mediaRoot())
  ? readdirSync(mediaRoot())
      .filter((f) => /^[a-f0-9-]+\.webp$/.test(f))
      .map((name) => ({
        name,
        data: readFileSync(join(mediaRoot(), name)).toString("base64"),
      }))
  : [];
const payload = Buffer.from(
    JSON.stringify({
      version: 1,
      created: new Date().toISOString(),
      database: readFileSync(snapshot).toString("base64"),
      media,
      recoveryKey: store.recoveryKeyPath && existsSync(store.recoveryKeyPath) ? readFileSync(store.recoveryKeyPath).toString("base64") : null,
    }),
  ),
  iv = randomBytes(12),
  cipher = createCipheriv("aes-256-gcm", key, iv),
  encrypted = Buffer.concat([cipher.update(payload), cipher.final()]);
const file = resolve("backups", `luhach-protected-${stamp}.json`);
writeFileSync(
  file,
  JSON.stringify({
    version: 1,
    algorithm: "AES-256-GCM",
    iv: iv.toString("hex"),
    tag: cipher.getAuthTag().toString("hex"),
    data: encrypted.toString("base64"),
  }),
);
// Verify the complete authenticated bundle and restore into a new, isolated path.
const envelope = JSON.parse(readFileSync(file)),
  decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(envelope.iv, "hex"),
  );
decipher.setAuthTag(Buffer.from(envelope.tag, "hex"));
const restored = JSON.parse(
  Buffer.concat([
    decipher.update(Buffer.from(envelope.data, "base64")),
    decipher.final(),
  ]),
);
const checkDir = resolve("data/restore-checks", stamp);
mkdirSync(checkDir, { recursive: true });
const checkFile = join(checkDir, "members.sqlite");
writeFileSync(checkFile, Buffer.from(restored.database, "base64"));
if (restored.recoveryKey) writeFileSync(checkFile+".recovery-key",Buffer.from(restored.recoveryKey,"base64"),{mode:0o600});
const check = new DatabaseSync(checkFile);
const integrity = check.prepare("PRAGMA integrity_check").get();
if (Object.values(integrity)[0] !== "ok")
  throw Error("Restored database failed integrity check.");
const people = check.prepare("SELECT COUNT(*) n FROM people").get().n,
  accounts = check.prepare("SELECT COUNT(*) n FROM credentials").get().n;
check.close();
for (const m of restored.media) {
  if (!/^[a-f0-9-]+\.webp$/.test(m.name)) throw Error("Unsafe media path");
  mkdirSync(join(checkDir, "media"), { recursive: true });
  writeFileSync(join(checkDir, "media", m.name), Buffer.from(m.data, "base64"));
}
const report = {
  file,
  sha256: createHash("sha256").update(readFileSync(file)).digest("hex"),
  integrity: "ok",
  people,
  accounts,
  media: restored.media.length,
  restorePath: checkDir,
  keyFile: keyPath,
  note: "Keep the key separately in your password manager. Do not upload it with the backup. Restore was verified without replacing the running database.",
};
writeFileSync(
  resolve("backups/latest-protected-backup-report.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
