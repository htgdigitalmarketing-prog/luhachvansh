import {
  randomBytes,
  randomUUID,
  createHash,
  scrypt as scryptCallback,
  timingSafeEqual,
  createCipheriv,
  createDecipheriv,
} from "node:crypto";
import {existsSync,readFileSync,writeFileSync} from "node:fs";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { Store, Problem } from "./store.mjs";
import { memberDbPath } from "./storage.mjs";
import { looseVillage, villageKey } from "./villages.mjs";
import { englishTexts } from "./heritage.mjs";
import { graphData } from "./viewer.mjs";
const scrypt = promisify(scryptCallback),
  DAY = 86400000;
// Name comparison folds only presentation differences (case, punctuation, nukta, chandrabindu) and a trailing
// clan name; it never guesses spellings.
const foldName = (x) =>
  looseVillage(x).replace(/\s+(?:luhach|लुहाच)$/u, "").trim();
const LIFE = ["adult", "child", "deceased", "unknown"];
const SOURCE_TYPES = ["family_knowledge", "family_document", "archive_record", "community_elder"];
const hash = (x) => createHash("sha256").update(String(x)).digest("hex");
const token = () => randomBytes(32).toString("base64url");
const need = (x, m, status = 400) => {
  if (!x) throw new Problem(m, status);
};
const text = (x, max = 1000) =>
  String(x ?? "")
    .trim()
    .slice(0, max);
const handle = (x) => text(x, 40).toLowerCase();
let activeHashes = 0;
async function derive(password, salt) {
  need(activeHashes < 2, "Authentication is busy. Please retry shortly.", 503);
  activeHashes++;
  try {
    return await scrypt(password, salt, 64, {
      N: 131072,
      r: 8,
      p: 1,
      maxmem: 256 * 1024 * 1024,
    });
  } finally {
    activeHashes--;
  }
}
async function passwordHash(password, salt = randomBytes(16).toString("hex")) {
  need(
    typeof password === "string" &&
      password.length >= 1 &&
      password.length <= 128,
    "Enter a password.",
  );
  const key = await derive(password, salt);
  return `${salt}:${key.toString("hex")}`;
}
async function passwordMatches(password, stored) {
  if (typeof password !== "string" || password.length > 128) return false;
  const [salt, expected] = stored.split(":");
  const key = await derive(password, salt);
  return timingSafeEqual(key, Buffer.from(expected, "hex"));
}
export class MemberStore extends Store {
  constructor(path = resolve("data/members.sqlite")) {
    super(path, { seed: false });
    this.recoveryKeyPath = path === ":memory:" ? null : resolve(path + ".recovery-key");
    if (path !== ":memory:" && this.one("SELECT name FROM sqlite_master WHERE name='credentials'") &&
        this.one("SELECT account_id FROM credentials LIMIT 1") && !this.one("SELECT name FROM sqlite_master WHERE name='recovery_vault'")) {
      const before = resolve(path + ".before-recovery-vault.sqlite");
      if (!existsSync(before)) this.db.prepare("VACUUM INTO ?").run(before);
    }
    // Additive migration: a stable human-readable code for people added after the original archive.
    if (!this.all("PRAGMA table_info(people)").some((c) => c.name === "public_code"))
      this.db.exec("ALTER TABLE people ADD COLUMN public_code TEXT");
    this.db.exec(`
   CREATE TABLE IF NOT EXISTS credentials(account_id TEXT PRIMARY KEY REFERENCES accounts(id),handle TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,recovery_hash TEXT NOT NULL,verified INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS invitations(hash TEXT PRIMARY KEY,label TEXT NOT NULL,created_by TEXT NOT NULL,expires INTEGER NOT NULL,used_by TEXT,revoked INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE IF NOT EXISTS throttles(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS member_sessions(hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),created INTEGER NOT NULL,last_seen INTEGER NOT NULL,expires INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS profile_privacy(person_id TEXT PRIMARY KEY REFERENCES people(id),audience TEXT NOT NULL DEFAULT 'private',life TEXT NOT NULL DEFAULT 'unknown',contact_audience TEXT NOT NULL DEFAULT 'private',email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',city TEXT NOT NULL DEFAULT '',updated INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS privacy_holds(person_id TEXT PRIMARY KEY REFERENCES people(id),reason TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS verification_details(claim_id TEXT PRIMARY KEY REFERENCES claims(id),relationship TEXT NOT NULL,method TEXT,reviewer TEXT,reviewed INTEGER);
   CREATE TABLE IF NOT EXISTS account_introductions(account_id TEXT PRIMARY KEY REFERENCES accounts(id),about_hi TEXT NOT NULL DEFAULT '',about_en TEXT NOT NULL DEFAULT '',family_hi TEXT NOT NULL DEFAULT '',family_en TEXT NOT NULL DEFAULT '',updated INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS recovery_vault(account_id TEXT PRIMARY KEY REFERENCES accounts(id),encrypted TEXT NOT NULL,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS recovery_requests(id TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),note TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL,decision TEXT);
   CREATE UNIQUE INDEX IF NOT EXISTS people_public_code ON people(public_code) WHERE public_code IS NOT NULL;
   CREATE TABLE IF NOT EXISTS claim_context(claim_id TEXT PRIMARY KEY REFERENCES claims(id),search_name TEXT NOT NULL DEFAULT '',search_village TEXT NOT NULL DEFAULT '',search_parent TEXT NOT NULL DEFAULT '',candidates INTEGER NOT NULL DEFAULT 0,similar TEXT NOT NULL DEFAULT '[]',created INTEGER NOT NULL);
  `);
    for (const p of this.all("SELECT id FROM people WHERE kind='community' AND public_code IS NULL"))
      this.assignCode(p.id);
  }
  // Original archive IDs (e.g. village_ii_38_8) are never changed. People added later keep their internal UUID
  // and receive a random code such as "LV-7K4Q-2M9D": it encodes no village, gender, generation or family,
  // never changes, and is never re-used, so a woman keeps one code across her birth and married families.
  assignCode(id) {
    const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    for (;;) {
      const b = randomBytes(8),
        c = [...b].map((x) => alphabet[x % 32]).join("");
      const code = `LV-${c.slice(0, 4)}-${c.slice(4)}`;
      if (this.one("SELECT id FROM people WHERE public_code=?", code)) continue;
      this.run("UPDATE people SET public_code=? WHERE id=? AND public_code IS NULL", code, id);
      return code;
    }
  }
  now() {
    return Date.now();
  }
  recoveryKey() {
    if (!this.recoveryKeyPath) return this.memoryRecoveryKey ??= randomBytes(32);
    if (!existsSync(this.recoveryKeyPath)) {
      need(!this.one("SELECT account_id FROM recovery_vault LIMIT 1"), "Recovery storage key is unavailable.", 503);
      try { writeFileSync(this.recoveryKeyPath, randomBytes(32), {flag:"wx",mode:0o600}); }
      catch(e) { if (e.code !== "EEXIST") throw e; }
    }
    const key = readFileSync(this.recoveryKeyPath);
    need(key.length === 32, "Recovery storage key is unavailable.", 503);
    return key;
  }
  storeRecoveryCopy(account, code) {
    const iv=randomBytes(12), cipher=createCipheriv("aes-256-gcm",this.recoveryKey(),iv);
    const encrypted=Buffer.concat([cipher.update(code,"utf8"),cipher.final()]);
    this.run("INSERT OR REPLACE INTO recovery_vault VALUES(?,?,?)", account,
      JSON.stringify({iv:iv.toString("base64"),tag:cipher.getAuthTag().toString("base64"),data:encrypted.toString("base64")}),Date.now());
  }
  owner(actor) {
    this.admin(actor);
    need(this.one("SELECT id FROM audit WHERE actor=? AND action='account_registered' AND json_extract(detail,'$.bootstrap')=1",actor),"Only the first owner administrator can access recovery copies.",403);
  }
  saveRecoveryCopy(actor, code) {
    this.user(actor);
    need(typeof code === "string" && hash(code) === this.one("SELECT recovery_hash FROM credentials WHERE account_id=?",actor)?.recovery_hash,"This recovery code is not current.",400);
    this.storeRecoveryCopy(actor,code);
    this.log(actor,"recovery_copy_saved",actor,{});
  }
  recoveryCopies(actor) {
    this.owner(actor);
    return this.all("SELECT v.*,a.name,c.handle FROM recovery_vault v JOIN accounts a ON a.id=v.account_id JOIN credentials c ON c.account_id=a.id").map(row=>{
      const e=JSON.parse(row.encrypted), d=createDecipheriv("aes-256-gcm",this.recoveryKey(),Buffer.from(e.iv,"base64"));d.setAuthTag(Buffer.from(e.tag,"base64"));
      return {name:row.name,username:row.handle,code:Buffer.concat([d.update(Buffer.from(e.data,"base64")),d.final()]).toString("utf8"),updated:row.created};
    });
  }
  requestRecovery(username, note) {
    this.throttle("recovery-help-global",20);
    const h=handle(username);this.throttle("recovery-help:"+h,3);
    need(text(note,500).length >= 5,"Explain how the administrator can identify you.");
    const candidates=this.all("SELECT c.account_id FROM credentials c JOIN accounts a ON a.id=c.account_id WHERE c.handle=? OR lower(a.name)=lower(?)",h,text(username,120));
    const c=candidates.length===1 ? candidates[0] : null;
    if (!c || this.one("SELECT id FROM recovery_requests WHERE account_id=? AND status='pending'",c.account_id)) return;
    this.run("INSERT INTO recovery_requests VALUES(?,?,?,'pending',?,NULL)",randomUUID(),c.account_id,text(note,500),Date.now());
  }
  issueRecovery(actor, id, reason) {
    this.owner(actor);need(text(reason).length >= 10,"Record how you checked the member's identity.");
    const r=this.one("SELECT * FROM recovery_requests WHERE id=? AND status='pending'",id);need(r,"Request is no longer pending.",409);
    need(r.account_id!==actor,"Use your saved owner code or an independent recovery process.",403);
    const code=token();
    this.transaction(()=>{this.run("UPDATE credentials SET recovery_hash=? WHERE account_id=?",hash(code),r.account_id);this.storeRecoveryCopy(r.account_id,code);this.run("DELETE FROM member_sessions WHERE account_id=?",r.account_id);this.run("UPDATE recovery_requests SET status='resolved',decision=? WHERE id=?",text(reason),id);this.log(actor,"assisted_recovery_issued",r.account_id,{request:id});});
    return {code};
  }
  login() {
    throw new Problem("Sample accounts cannot sign into the member area.", 403);
  }
  advance() {
    throw new Problem("The member area uses the real clock.", 403);
  }
  actor(raw) {
    if (!raw) return null;
    const row = this.one(
      "SELECT a.*,c.handle,c.verified,s.last_seen,s.expires FROM member_sessions s JOIN accounts a ON a.id=s.account_id JOIN credentials c ON c.account_id=a.id WHERE s.hash=?",
      hash(raw),
    );
    if (
      !row ||
      row.expires <= Date.now() ||
      row.last_seen < Date.now() - 30 * 60 * 1000
    ) {
      this.run("DELETE FROM member_sessions WHERE hash=?", hash(raw));
      return null;
    }
    this.run(
      "UPDATE member_sessions SET last_seen=? WHERE hash=?",
      Date.now(),
      hash(raw),
    );
    return {
      id: row.id,
      name: row.name,
      role: row.role,
      handle: row.handle,
      verified: !!row.verified,
    };
  }
  session(id) {
    const raw = token();
    this.run(
      "INSERT INTO member_sessions VALUES(?,?,?,?,?)",
      hash(raw),
      id,
      Date.now(),
      Date.now(),
      Date.now() + DAY,
    );
    return raw;
  }
  logout(raw) {
    if (raw) this.run("DELETE FROM member_sessions WHERE hash=?", hash(raw));
  }
  throttle(key, max = 6) {
    const k = hash(key),
      now = Date.now();
    let row = this.one("SELECT * FROM throttles WHERE key=?", k);
    if (!row || row.until <= now) {
      this.run(
        "INSERT OR REPLACE INTO throttles VALUES(?,?,?)",
        k,
        1,
        now + 15 * 60 * 1000,
      );
      return;
    }
    need(row.count < max, "Too many attempts. Try again in 15 minutes.", 429);
    this.run("UPDATE throttles SET count=count+1 WHERE key=?", k);
  }
  async register(input, bootstrap = false) {
    const username = handle(input.username),
      name = text(input.name, 120);
    this.throttle("register", 20);
    need(
      /^[a-z0-9][a-z0-9._-]{2,39}$/.test(username),
      "Choose a username of 3–40 letters, numbers, dots, dashes or underscores.",
    );
    need(name.length >= 2, "Enter your name.");
    need(
      input.adult === true,
      "Member accounts are for adults. A verified guardian manages child profiles.",
    );
    need(
      input.consent === true,
      "Accept the member privacy notice to continue.",
    );
    const invitation = hash(text(input.code, 200));
    const validate = () => {
      if (bootstrap) {
        need(
          !this.one("SELECT account_id FROM credentials LIMIT 1"),
          "Owner setup is complete.",
          409,
        );
        const b = this.one("SELECT value FROM meta WHERE key='owner_setup'");
        need(b && b.value === invitation, "Invalid owner setup code.", 403);
      } else {
        const i = this.one(
          "SELECT * FROM invitations WHERE hash=?",
          invitation,
        );
        need(
          i && !i.used_by && !i.revoked && i.expires > Date.now(),
          "This invitation is invalid, expired or already used.",
          403,
        );
      }
    };
    validate();
    const encoded = await passwordHash(input.password);
    const recovery = token(),
      id = randomUUID();
    this.transaction(() => {
      validate();
      need(
        !this.one(
          "SELECT account_id FROM credentials WHERE handle=?",
          username,
        ),
        "This username is unavailable.",
        409,
      );
      this.run(
        "INSERT INTO accounts VALUES(?,?,?)",
        id,
        name,
        bootstrap ? "admin" : "member",
      );
      this.run(
        "INSERT INTO credentials VALUES(?,?,?,?,?,?)",
        id,
        username,
        encoded,
        hash(recovery),
        bootstrap ? 1 : 0,
        Date.now(),
      );
      if (bootstrap) this.run("DELETE FROM meta WHERE key='owner_setup'");
      else
        this.run(
          "UPDATE invitations SET used_by=? WHERE hash=?",
          id,
          invitation,
        );
      this.storeRecoveryCopy(id, recovery);
      this.log(id, "account_registered", id, {
        adult: true,
        privacyNotice: "2026-10-10",
        bootstrap,
      });
    });
    return { token: this.session(id), recovery };
  }
  async authenticate(username, password) {
    const h = handle(username);
    this.throttle("login:" + h);
    this.throttle("login-global", 40);
    const c = this.one("SELECT * FROM credentials WHERE handle=?", h);
    // Equal-cost comparison also runs for unknown usernames.
    const valid = await passwordMatches(
      password,
      c?.password_hash || "0".repeat(32) + ":" + "0".repeat(128),
    );
    need(
      c &&
        valid &&
        this.one(
          "SELECT password_hash FROM credentials WHERE account_id=?",
          c.account_id,
        )?.password_hash === c.password_hash,
      "Username or password is incorrect.",
      401,
    );
    this.run("DELETE FROM throttles WHERE key=?", hash("login:" + h));
    return { token: this.session(c.account_id) };
  }
  async recover(username, code, password) {
    const h = handle(username);
    this.throttle("recover:" + h);
    this.throttle("recover-global", 20);
    const c = this.one("SELECT * FROM credentials WHERE handle=?", h);
    need(
      c && c.recovery_hash === hash(text(code, 200)),
      "Recovery details are incorrect.",
      401,
    );
    const encoded = await passwordHash(password),
      recovery = token();
    this.transaction(() => {
      const current = this.one(
        "SELECT recovery_hash FROM credentials WHERE account_id=?",
        c.account_id,
      );
      need(
        current.recovery_hash === hash(text(code, 200)),
        "Recovery code has already been used.",
        409,
      );
      this.run(
        "UPDATE credentials SET password_hash=?,recovery_hash=? WHERE account_id=?",
        encoded,
        hash(recovery),
        c.account_id,
      );
      this.run("DELETE FROM member_sessions WHERE account_id=?", c.account_id);
      this.storeRecoveryCopy(c.account_id, recovery);
      this.log(c.account_id, "account_recovered", c.account_id, {});
    });
    return { token: this.session(c.account_id), recovery };
  }
  async changePassword(actor, oldPassword, newPassword) {
    const c = this.one("SELECT * FROM credentials WHERE account_id=?", actor);
    this.throttle("password:" + actor);
    need(
      c && (await passwordMatches(oldPassword, c.password_hash)),
      "Current password is incorrect.",
      401,
    );
    const encoded = await passwordHash(newPassword),
      recovery = token();
    this.transaction(() => {
      need(
        this.one(
          "SELECT password_hash FROM credentials WHERE account_id=?",
          actor,
        )?.password_hash === c.password_hash,
        "Credentials changed. Sign in again.",
        409,
      );
      this.run(
        "UPDATE credentials SET password_hash=?,recovery_hash=? WHERE account_id=?",
        encoded,
        hash(recovery),
        actor,
      );
      this.run("DELETE FROM member_sessions WHERE account_id=?", actor);
      this.storeRecoveryCopy(actor, recovery);
      this.log(actor, "password_changed", actor, {});
    });
    return { token: this.session(actor), recovery };
  }
  async appointReviewer(actor, id, password, reason) {
    this.admin(actor);
    need(actor !== id, "You cannot change your own administrator role.", 403);
    need(
      text(reason).length >= 15,
      "Record why this member is being appointed.",
    );
    const c = this.one(
      "SELECT password_hash FROM credentials WHERE account_id=?",
      actor,
    );
    this.throttle("appoint:" + actor);
    need(
      await passwordMatches(password, c.password_hash),
      "Current password is incorrect.",
      401,
    );
    need(
      this.one("SELECT verified FROM credentials WHERE account_id=?", id)
        ?.verified,
      "Verify the member before appointing a reviewer.",
    );
    this.run("UPDATE accounts SET role='admin' WHERE id=?", id);
    this.run("DELETE FROM member_sessions WHERE account_id=?", id);
    this.log(actor, "reviewer_appointed", id, { reason: text(reason) });
    this.notify(
      id,
      null,
      "You have been appointed a community reviewer. Sign in again.",
    );
  }
  invite(actor, label) {
    this.admin(actor);
    need(
      text(label, 120).length >= 2,
      "Add a recipient label for your invitation.",
    );
    const raw = token();
    this.run(
      "INSERT INTO invitations VALUES(?,?,?,?,NULL,0)",
      hash(raw),
      text(label, 120),
      actor,
      Date.now() + 7 * DAY,
    );
    this.log(actor, "invitation_created", hash(raw), {
      label: text(label, 120),
    });
    return { code: raw, expires: Date.now() + 7 * DAY };
  }
  revokeInvite(actor, id) {
    this.admin(actor);
    this.run(
      "UPDATE invitations SET revoked=1 WHERE hash=? AND used_by IS NULL",
      id,
    );
    this.log(actor, "invitation_revoked", id, {});
  }
  notify(account, proposal, body) {
    if (account === "admin") {
      for (const a of this.all("SELECT id FROM accounts WHERE role='admin'"))
        super.notify(a.id, proposal, body);
    } else super.notify(account, proposal, body);
  }
  verified(id) {
    const a = this.user(id);
    return (
      a.role === "admin" ||
      !!this.one("SELECT verified FROM credentials WHERE account_id=?", id)
        ?.verified
    );
  }
  owns(id, p) {
    return !!this.one(
      "SELECT id FROM claims WHERE account_id=? AND person_id=? AND status='approved'",
      id,
      p,
    );
  }
  privacy(id) {
    return (
      this.one("SELECT * FROM profile_privacy WHERE person_id=?", id) || {
        person_id: id,
        audience: this.person(id)?.kind === "archive" ? "verified" : "private",
        life: "unknown",
        contact_audience: "private",
        email: "",
        phone: "",
        city: "",
      }
    );
  }
  visible(actor, id) {
    if (!actor) return false;
    const a = this.user(actor);
    if (a.role === "admin" || this.owns(actor, id)) return true;
    const p = this.privacy(id);
    if (this.verified(actor) && ["verified", "public"].includes(p.audience) && p.life !== "child")
      return true;
    return this.familyCircle(actor, id);
  }
  // A relative added through an accepted proposal stays private, yet is shown to the members whose own
  // (self/guardian) verified node is directly linked to them. A child is shown only to the member whose node
  // is the child's recorded parent. Once the relative verifies their own profile, or an administrator places a
  // privacy hold, only their own sharing choice applies.
  familyCircle(actor, id) {
    const p = this.person(id);
    if (!p || p.kind !== "community" || !p.proposal_id) return false;
    if (
      this.one("SELECT person_id FROM privacy_holds WHERE person_id=?", id) ||
      this.one(
        "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.person_id=? AND c.status='approved' AND v.relationship='self'",
        id,
      )
    )
      return false;
    const mine = this.all(
      "SELECT c.person_id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.account_id=? AND c.status='approved' AND v.relationship IN ('self','guardian')",
      actor,
    ).map((r) => r.person_id);
    if (!mine.length) return false;
    const marks = mine.map(() => "?").join(",");
    if (this.privacy(id).life === "child")
      return !!this.one(
        `SELECT id FROM relationships WHERE active=1 AND type='parent' AND b=? AND a IN (${marks})`,
        id,
        ...mine,
      );
    return !!this.one(
      `SELECT id FROM relationships WHERE active=1 AND ((a=? AND b IN (${marks})) OR (b=? AND a IN (${marks})))`,
      id,
      ...mine,
      id,
      ...mine,
    );
  }
  personalClaim(actor) {
    return this.one(
      `SELECT c.id,c.status,c.person_id,c.created,p.name AS person_name,p.village AS person_village,p.kind,
        coalesce(p.legacy_id,p.public_code,'') AS person_code,p.generation AS person_generation,
        (SELECT f.name FROM relationships r JOIN people f ON f.id=r.a WHERE r.b=c.person_id AND r.type='parent' AND r.active=1 ORDER BY CASE r.role WHEN 'father' THEN 0 ELSE 1 END LIMIT 1) AS person_parent
       FROM claims c JOIN verification_details v ON v.claim_id=c.id JOIN people p ON p.id=c.person_id WHERE c.account_id=? AND v.relationship='self' AND c.status IN ('pending','approved') ORDER BY c.created DESC LIMIT 1`,
      actor,
    );
  }
  isOriginalOwner(actor) {
    return (
      this.user(actor).role === "admin" &&
      !!this.one(
        "SELECT id FROM audit WHERE actor=? AND action='account_registered' AND json_extract(detail,'$.bootstrap')=1",
        actor,
      )
    );
  }
  // Narrow exception, explicitly requested by the site owner ("i am super admin. i need no reviewer"): only the
  // original bootstrap owner may confirm their OWN pending self claim, by an explicit confirmation with a written
  // statement, recorded in the audit log. It never happens automatically, never for anyone else's claim, and
  // ordinary members and appointed reviewers keep the independent-review rule (verifyClaim).
  confirmOwnNode(actor, claimId, input = {}) {
    need(this.isOriginalOwner(actor), "Only the original owner account can confirm its own entry.", 403);
    need(input.confirm === true, "Tick the confirmation that this archive entry is your own.");
    need(text(input.statement).length >= 15, "Write how you know this entry is yours (at least 15 characters).");
    this.transaction(() => {
      const c = this.one(
        "SELECT c.*,v.relationship FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.id=?",
        claimId,
      );
      need(c && c.status === "pending", "Claim is no longer pending.", 409);
      need(c.account_id === actor && c.relationship === "self", "Only your own personal claim can be confirmed here.", 403);
      need(
        !this.one("SELECT id FROM claims WHERE person_id=? AND status='approved'", c.person_id),
        "A steward already holds this profile; resolve ownership separately.",
        409,
      );
      const p = this.person(c.person_id);
      need(p, "Profile not available.", 404);
      this.run("UPDATE claims SET status='approved',decision=? WHERE id=?", "Original owner self-confirmation: " + text(input.statement), c.id);
      this.run(
        "UPDATE verification_details SET method='owner_self_confirmation',reviewer=?,reviewed=? WHERE claim_id=?",
        actor,
        Date.now(),
        c.id,
      );
      this.run(
        "UPDATE proposals SET due=? WHERE author=? AND anchor=? AND status='pending' AND json_extract(payload,'$.relative')=1",
        this.now() + 7 * DAY,
        actor,
        c.person_id,
      );
      this.log(actor, "owner_self_node_confirmed", c.person_id, {
        claim: c.id,
        code: p.legacy_id || p.public_code || "",
        name: p.name,
        village: p.village,
        statement: text(input.statement),
      });
    });
  }
  // Archive entries an unlinked member may see while choosing their own node: shared, adult, not on hold.
  claimable(id) {
    const p = this.person(id),
      s = this.privacy(id);
    return (
      !!p &&
      p.kind === "archive" &&
      ["verified", "public"].includes(s.audience) &&
      s.life !== "child" &&
      !this.one("SELECT person_id FROM privacy_holds WHERE person_id=?", id)
    );
  }
  // Explicit candidate list for node-claim onboarding. Name plus village or parent is required so a bare
  // same-name match is never offered alone; nothing is pre-selected and ambiguity is shown, not resolved.
  claimCandidates(actor, input = {}) {
    this.user(actor);
    this.throttle("candidates:" + actor, 60);
    // A relative added by a family member is private, so it never appears in name search. Its family-shared
    // code (LV-XXXX-XXXX) lets that adult find and claim their own entry; children and held entries never match.
    const code = text(input.code, 20).toUpperCase();
    if (code) {
      const p = this.one("SELECT id,name,village,public_code FROM people WHERE public_code=? AND active=1 AND kind='community'", code);
      const ok =
        p &&
        this.privacy(p.id).life !== "child" &&
        !this.one("SELECT person_id FROM privacy_holds WHERE person_id=?", p.id) &&
        !this.one(
          "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.person_id=? AND c.status IN ('pending','approved') AND v.relationship='self'",
          p.id,
        );
      return {
        candidates: ok ? [{ id: p.id, name: p.name, nameEnglish: englishTexts([p.name])[0], village: p.village, villageEnglish: englishTexts([p.village])[0], generation: "", serial: p.public_code, father: null, grandfather: null, linked: false }] : [],
        total: ok ? 1 : 0,
        limited: false,
      };
    }
    const name = foldName(text(input.name, 120)),
      village = text(input.village, 120),
      parent = foldName(text(input.parent, 120));
    need(name.length >= 2, "Enter the name recorded for you in the family archive.");
    need(
      village || parent.length >= 2,
      "Add your village or your father's or mother's name so that people with the same name are not confused.",
    );
    const vkey = village ? villageKey(village) : "",
      vloose = looseVillage(village);
    const latin = /[a-z]/.test(name + " " + parent);
    let rows = this.all(
      "SELECT id,name,village,generation,legacy_id FROM people WHERE active=1 AND kind='archive'",
    );
    if (vkey) {
      const keys = new Map();
      const keyOf = (v) => (keys.has(v) ? keys.get(v) : keys.set(v, villageKey(v)).get(v));
      rows = rows.filter((r) => keyOf(r.village) === vkey || looseVillage(r.village).includes(vloose));
    }
    const english = latin ? englishTexts(rows.map((r) => r.name)) : [];
    const score = (names, q) =>
      names.some((n) => n === q)
        ? 2
        : names.some((n) => n.includes(q) || q.split(" ").every((w) => n.includes(w)))
          ? 1
          : 0;
    let matched = rows
      .map((r, i) => ({ r, en: english[i], score: score([foldName(r.name), latin ? foldName(english[i]) : ""].filter(Boolean), name) }))
      .filter((m) => m.score && this.claimable(m.r.id));
    const parentOf = (id) =>
      this.one(
        "SELECT p.id,p.name,r.role FROM relationships r JOIN people p ON p.id=r.a WHERE r.active=1 AND r.type='parent' AND r.b=? AND p.active=1 ORDER BY CASE r.role WHEN 'father' THEN 0 ELSE 1 END LIMIT 1",
        id,
      );
    matched = matched.map((m) => ({ ...m, father: parentOf(m.r.id) }));
    if (parent.length >= 2)
      matched = matched.filter((m) => {
        if (!m.father) return false;
        const names = [foldName(m.father.name)];
        if (latin) names.push(foldName(englishTexts([m.father.name])[0]));
        return names.some((n) => n === parent || n.includes(parent));
      });
    matched.sort((a, b) => b.score - a.score || String(a.r.generation).localeCompare(String(b.r.generation)));
    const candidates = matched.slice(0, 25).map(({ r, en, father }) => {
      const grandfather = father ? parentOf(father.id) : null;
      const [nameEnglish, villageEnglish, fatherEnglish, grandEnglish] = englishTexts([
        r.name,
        r.village,
        father?.name || "",
        grandfather?.name || "",
      ]);
      return {
        id: r.id,
        name: r.name,
        nameEnglish: en || nameEnglish,
        village: r.village,
        villageEnglish,
        generation: r.generation || "",
        serial: r.legacy_id || "",
        father: father && this.claimable(father.id) ? { name: father.name, nameEnglish: fatherEnglish, relationship: father.role || "parent" } : null,
        grandfather: grandfather && this.claimable(grandfather.id) ? { name: grandfather.name, nameEnglish: grandEnglish } : null,
        linked: !!this.one(
          "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.person_id=? AND c.status='approved' AND v.relationship='self'",
          r.id,
        ),
      };
    });
    return { candidates, total: matched.length, limited: matched.length > candidates.length };
  }
  requestNodeClaim(actor, input = {}) {
    this.user(actor);
    need(!this.personalClaim(actor), "Your account already has a personal profile request. Ask an administrator to change it.", 409);
    need(
      input.confirm === true,
      "Confirm that you checked the name, father, village and generation before choosing this entry.",
    );
    const search = {
      name: text(input.searchName, 120),
      village: text(input.searchVillage, 120),
      parent: text(input.searchParent, 120),
      code: text(input.searchCode, 20),
    };
    const found = this.claimCandidates(actor, search);
    // The chosen node must come from the explicit candidate list the member actually saw.
    need(found.candidates.some((c) => c.id === input.id), "Choose one of the listed archive entries.");
    const claim = this.requestClaim(actor, input.id, input.reason, "self", !!search.code);
    this.run(
      "INSERT INTO claim_context VALUES(?,?,?,?,?,?,?)",
      claim,
      search.code ? "code " + search.code.toUpperCase() : search.name,
      search.village,
      search.parent,
      found.total,
      JSON.stringify(found.candidates.filter((c) => c.id !== input.id).slice(0, 10).map((c) => c.id)),
      Date.now(),
    );
    return claim;
  }
  // A missing person gets a private new-profile request, never a silent duplicate of a visible entry.
  requestNewProfile(actor, input = {}) {
    this.user(actor);
    const name = text(input.name, 120),
      village = text(input.village, 120),
      parent = text(input.parentName, 120);
    need(name.length >= 2 && village, "Enter your name and ancestral village.");
    need(parent.length >= 2, "Enter your father's or mother's name so reviewers can place the new profile.");
    need(input.notListed === true, "Confirm that none of the listed archive entries is you.");
    const same = this.all("SELECT id,name,village FROM people WHERE active=1").filter(
      (p) => foldName(p.name) === foldName(name) && villageKey(p.village) === villageKey(village),
    );
    need(
      !same.some((r) => this.claimable(r.id)) || input.confirmDistinct === true,
      "A person with this name is already recorded in this village. Choose that entry, or confirm that you are a different person.",
      409,
    );
    const id = this.createProfile(actor, { ...input, name, village });
    const claim = this.one("SELECT id FROM claims WHERE person_id=? AND account_id=?", id, actor).id;
    this.run(
      "INSERT INTO claim_context VALUES(?,?,?,?,?,?,?)",
      claim,
      name,
      village,
      parent,
      same.length,
      JSON.stringify(same.slice(0, 10).map((r) => r.id)),
      Date.now(),
    );
    return id;
  }
  // A relative's village or birth place may be explicitly unknown: it is stored blank, never guessed (for example
  // never copied from the husband's village). The duplicate check then compares names among blank-place entries.
  validatePayload(anchor, payload) {
    const unknown =
      !payload.existingId && !text(payload.village) && (payload.villageUnknown === true || payload.relative === true);
    if (!unknown) return super.validatePayload(anchor, payload);
    const p = super.validatePayload(anchor, { ...payload, village: "⁣unknown-place" });
    need(
      !this.all("SELECT name FROM people WHERE active=1 AND village=''").some((r) => foldName(r.name) === foldName(p.name)),
      "This name already exists in the same village. Select the existing person instead.",
      409,
    );
    return { ...p, village: "" };
  }
  // Existing people a member may link as a relative: visible to them, or a shared adult archive entry.
  linkable(actor, id) {
    return this.visible(actor, id) || this.claimable(id);
  }
  // Structured spouse / mother / daughter (and father / son) proposal anchored on the member's own claimed node.
  // Each proposal carries its source and explicit birth or marriage link. It follows the seven-day objection
  // window (the user's chosen policy): once the author's own identity claim is approved, a valid proposal with no
  // objection or conflict is accepted when the window ends. It waits while the identity is unverified, pauses on
  // any objection or conflict, and a child's record always needs an administrator. Authors never accept their own.
  proposeRelative(actor, input = {}) {
    this.user(actor);
    const own = this.personalClaim(actor);
    need(own, "Link your account to your own family entry first.", 403);
    need(LIFE.includes(input.life), "Choose the relative's life stage.");
    need(SOURCE_TYPES.includes(input.sourceType), "Choose the kind of source.");
    need(text(input.source, 1000).length >= 15, "Describe the source of this information (at least 15 characters).");
    for (const id of [input.existingId, input.secondId].filter(Boolean))
      need(this.person(id) && this.linkable(actor, id), "Profile not available.", 404);
    const anchor = this.person(own.person_id);
    need(anchor, "Profile not available.", 404);
    need(
      input.existingId || text(input.village) || input.villageUnknown === true,
      "Enter the village or place, or mark it as not known.",
    );
    const p = {
      ...this.validatePayload(anchor, input),
      life: input.existingId ? this.privacy(input.existingId).life : input.life,
      sourceType: input.sourceType,
      birthFamily: text(input.birthFamily, 300),
      marriage: text(input.marriage, 300),
      villageUnknown: !input.existingId && !text(input.village),
      relative: true,
    };
    need(
      !this.all(
        "SELECT payload FROM proposals WHERE anchor=? AND status IN ('pending','disputed','conflict')",
        anchor.id,
      ).some((r) => {
        const q = JSON.parse(r.payload);
        return q.relation === p.relation && (p.existingId ? q.existingId === p.existingId : !q.existingId && foldName(q.name) === foldName(p.name));
      }),
      "The same relative is already awaiting review.",
      409,
    );
    this.validateEdges(this.edgesFor(anchor.id, p.existingId || "new-person", p));
    const id = randomUUID();
    this.transaction(() => {
      this.run(
        "INSERT INTO proposals(id,author,anchor,version,payload,status,created,due) VALUES(?,?,?,?,?,?,?,?)",
        id,
        actor,
        anchor.id,
        anchor.version,
        JSON.stringify(p),
        "pending",
        this.now(),
        this.now() + 7 * DAY,
      );
      this.log(actor, "relative_proposed", anchor.id, {
        proposal: id,
        relation: p.relation,
        existing: !!p.existingId,
        linked: !!p.secondId,
      });
      this.notify("admin", id, "A sourced relative proposal is open for objections.");
      this.notify(actor, id, "Your relative proposal is open for seven days of review.");
    });
    return id;
  }
  accept(actor, id, automatic = false, reason = "") {
    const row = this.one("SELECT author,anchor,payload FROM proposals WHERE id=?", id);
    const payload = row ? JSON.parse(row.payload) : {};
    if (payload.relative) {
      need(
        this.identityApproved(row.author, row.anchor),
        "The proposer's own identity claim must be approved before this relative can be linked.",
        409,
      );
      need(!automatic || payload.life !== "child", "A child's record needs an administrator decision.", 409);
    }
    super.accept(actor, id, automatic, reason);
    const created = this.one("SELECT id FROM people WHERE proposal_id=?", id);
    if (created) this.assignCode(created.id);
    if (created && !this.one("SELECT person_id FROM profile_privacy WHERE person_id=?", created.id))
      this.run(
        "INSERT INTO profile_privacy VALUES(?,?,?,?,?,?,?,?)",
        created.id,
        "private",
        LIFE.includes(payload.life) ? payload.life : "unknown",
        "private",
        "",
        "",
        "",
        Date.now(),
      );
  }
  identityApproved(account, person) {
    return !!this.one(
      "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.account_id=? AND c.person_id=? AND c.status='approved' AND v.relationship='self'",
      account,
      person,
    );
  }
  // Store.tick plus two holds for relative proposals: they stay pending (not "conflict") while the author's
  // identity is unverified, and a child's record is never accepted by the clock.
  tick() {
    this.transaction(() => {
      for (const p of this.all(
        "SELECT id,author,anchor,payload FROM proposals WHERE status='pending' AND due<=?",
        this.now(),
      )) {
        const q = JSON.parse(p.payload);
        if (q.relative && (q.life === "child" || !this.identityApproved(p.author, p.anchor))) continue;
        try {
          this.accept("system", p.id, true);
        } catch (e) {
          if (!(e instanceof Problem)) throw e;
          this.run("UPDATE proposals SET status='conflict',decision=? WHERE id=?", e.message, p.id);
          this.notify("admin", p.id, "Automatic acceptance paused: " + e.message);
        }
      }
    });
  }
  requireVisible(actor, id) {
    need(
      this.person(id) && this.visible(actor, id),
      "Profile not available.",
      404,
    );
  }
  safePerson(actor, p) {
    if (!p || !this.visible(actor, p.id)) return null;
    const a = this.user(actor),
      owner = this.owns(actor, p.id),
      privacy = this.privacy(p.id);
    const result = {
      id: p.id,
      name: p.name,
      aliases: p.aliases,
      gender: p.gender,
      village: p.village,
      kind: p.kind,
      relationship: p.relationship,
      life: privacy.life,
      audience: privacy.audience,
    };
    if (owner || a.role === "admin")
      Object.assign(result, {
        source: p.source,
        source_page: p.source_page,
        notes: p.notes,
      });
    if (
      a.role === "admin" ||
      owner ||
      (privacy.contact_audience === "verified" &&
        privacy.life === "adult" &&
        this.verified(actor))
    )
      result.contact = {
        email: privacy.email,
        phone: privacy.phone,
        city: privacy.city,
      };
    return result;
  }
  searchFor(actor, q = "", village = "") {
    this.user(actor);
    const clean = text(q, 100);
    if (!this.verified(actor)) {
      if (clean.length < 2) return [];
      // Unverified invitees can locate an archival entry to request verification, not browse its graph or notes.
      return super
        .search(clean, village, "archive")
        .filter((p) => {
          const s = this.privacy(p.id);
          return ["verified", "public"].includes(s.audience) && s.life !== "child";
        })
        .map((p) => ({
          id: p.id,
          name: p.name,
          village: p.village,
          kind: p.kind,
          claimOnly: true,
        }));
    }
    return super
      .search(clean, village)
      .map((p) => this.safePerson(actor, p))
      .filter(Boolean);
  }
  familyFor(actor, id) {
    this.requireVisible(actor, id);
    const f = super.family(id);
    return {
      person: this.safePerson(actor, f.person),
      parents: f.parents.map((p) => this.safePerson(actor, p)).filter(Boolean),
      spouses: f.spouses.map((p) => this.safePerson(actor, p)).filter(Boolean),
      children: f.children
        .map((p) => this.safePerson(actor, p))
        .filter(Boolean),
      siblings: f.siblings
        .map((p) => this.safePerson(actor, p))
        .filter(Boolean),
    };
  }
  // Data for the signed-in visual explorer: every recorded ancestor of the member's own approved node plus the
  // nearby family (three links out: siblings, cousins, spouses and their birth families, children). The walk only
  // passes through people this member may see, so it does not reveal the shape of private branches.
  memberTree(actor, focus = "") {
    this.user(actor);
    const own = this.all(
      "SELECT c.person_id FROM claims c WHERE c.account_id=? AND c.status='approved'",
      actor,
    ).map((r) => r.person_id).filter((id) => this.person(id));
    const start = focus && this.person(focus) && this.visible(actor, focus) ? [focus] : own;
    need(start.length, "Link and verify your own family entry to open your family tree.", 403);
    const edges = this.all("SELECT id,a,b,type,role FROM relationships WHERE active=1");
    const near = new Map(), up = new Map();
    for (const e of edges) {
      for (const [x, y] of [[e.a, e.b], [e.b, e.a]]) (near.get(x) || near.set(x, []).get(x)).push(y);
      if (e.type === "parent") (up.get(e.b) || up.set(e.b, []).get(e.b)).push(e.a);
    }
    const allowed = new Map(),
      can = (id) => (allowed.has(id) ? allowed.get(id) : allowed.set(id, this.visible(actor, id)).get(id));
    const keep = new Set(start), LIMIT = 1500;
    for (const id of start) for (let stack = [id]; stack.length && keep.size < LIMIT; )
      for (const parent of up.get(stack.pop()) || []) if (!keep.has(parent) && can(parent)) { keep.add(parent); stack.push(parent); }
    // Ancestors already in `keep` must still be visited by the nearby-family walk.
    // A separate visited set lets us cross a parent and descend to siblings/cousins.
    const visited = new Set(start);
    let frontier = [...start];
    for (let depth = 0; depth < 3 && frontier.length && keep.size < LIMIT; depth++) {
      const next = [];
      for (const id of frontier) for (const n of near.get(id) || []) if (!visited.has(n) && can(n) && keep.size < LIMIT) { visited.add(n); keep.add(n); next.push(n); }
      frontier = next;
    }
    const people = [...keep].map((id) => this.person(id)).filter(Boolean);
    const data = graphData(people, edges.filter((e) => keep.has(e.a) && keep.has(e.b)));
    const names = englishTexts(data.records.map((r) => r.name)),
      villages = englishTexts(data.records.map((r) => r.villageName));
    return {
      ...data,
      records: data.records.map((r, i) => ({ ...r, nameEnglish: names[i], villageEnglish: villages[i] })),
      focus: start[0],
      own,
      limited: keep.size >= LIMIT,
    };
  }
  requestClaim(actor, id, reason, relationship, viaFamilyCode = false) {
    this.user(actor);
    need(
      ["self", "guardian", "relative"].includes(relationship),
      "Choose how you are connected.",
    );
    const p = this.person(id);
    need(p, "Profile not available.", 404);
    const policy = this.privacy(id);
    need(
      (p.kind === "archive" &&
        ["verified", "public"].includes(policy.audience) &&
        policy.life !== "child") ||
        this.visible(actor, id) ||
        (viaFamilyCode && relationship === "self") ||
        !!this.one(
          "SELECT id FROM proposals WHERE id=? AND author=? AND person_id=?",
          p.proposal_id,
          actor,
          id,
        ),
      "Profile not available.",
      404,
    );
    need(
      !this.one(
        "SELECT id FROM claims WHERE account_id=? AND person_id=? AND status IN ('pending','approved')",
        actor,
        id,
      ),
      "You already have a request for this profile.",
      409,
    );
    need(
      relationship !== "self" || !this.personalClaim(actor),
      "Your account already has a personal profile request. Ask an administrator to change it.",
      409,
    );
    need(
      text(reason).length >= 15,
      "Explain your connection and how a reviewer can check it (at least 15 characters).",
    );
    const claim = randomUUID();
    this.transaction(() => {
      this.run(
        "INSERT INTO claims VALUES(?,?,?,?,?,?,NULL)",
        claim,
        actor,
        id,
        text(reason),
        "pending",
        Date.now(),
      );
      this.run(
        "INSERT INTO verification_details VALUES(?,?,NULL,NULL,NULL)",
        claim,
        relationship,
      );
      this.log(actor, "verification_requested", id, { claim, relationship });
      this.notify(
        "admin",
        null,
        "A family profile verification request needs review.",
      );
    });
    return claim;
  }
  createProfile(actor, input) {
    this.user(actor);
    need(
      !this.one(
        "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE account_id=? AND relationship='self' AND status IN ('pending','approved')",
        actor,
      ),
      "You already have a personal profile request.",
      409,
    );
    need(
      text(input.name, 120).length >= 2 && text(input.village, 120),
      "Enter your name and ancestral village.",
    );
    need(
      text(input.reason).length >= 15,
      "Explain your family connection for verification.",
    );
    const id = randomUUID(),
      claim = randomUUID();
    this.transaction(() => {
      this.run(
        "INSERT INTO people(id,name,aliases,gender,village,source,kind) VALUES(?,?,?,?,?,?,'community')",
        id,
        text(input.name, 120),
        text(input.aliases, 120),
        "unknown",
        text(input.village, 120),
        "Self-submitted profile; verification required",
      );
      this.assignCode(id);
      this.run(
        "INSERT INTO profile_privacy VALUES(?,?,?,?,?,?,?,?)",
        id,
        "private",
        "adult",
        "private",
        "",
        "",
        "",
        Date.now(),
      );
      this.run(
        "INSERT INTO claims VALUES(?,?,?,?,?,?,NULL)",
        claim,
        actor,
        id,
        text(input.reason),
        "pending",
        Date.now(),
      );
      this.run(
        "INSERT INTO verification_details VALUES(?,'self',NULL,NULL,NULL)",
        claim,
      );
      this.log(actor, "profile_requested", id, { claim });
      this.notify(
        "admin",
        null,
        "A new private member profile needs verification.",
      );
    });
    return id;
  }
  verifyClaim(actor, id, approve, reason, method) {
    this.admin(actor);
    need(
      ["family_knowledge", "contacted_member", "family_records"].includes(
        method,
      ),
      "Record how you checked the connection.",
    );
    need(
      text(reason).length >= 15,
      "Record what you checked (at least 15 characters).",
    );
    this.transaction(() => {
      const c = this.one(
        "SELECT c.*,v.relationship FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.id=?",
        id,
      );
      need(c && c.status === "pending", "Claim is no longer pending.", 409);
      need(
        c.account_id !== actor,
        "A separate reviewer must decide your claim.",
        403,
      );
      need(
        !approve ||
          !this.one(
            "SELECT id FROM claims WHERE person_id=? AND status='approved'",
            c.person_id,
          ),
        "A steward already holds this profile; resolve ownership separately.",
        409,
      );
      this.run(
        "UPDATE claims SET status=?,decision=? WHERE id=?",
        approve ? "approved" : "rejected",
        text(reason),
        id,
      );
      this.run(
        "UPDATE verification_details SET method=?,reviewer=?,reviewed=? WHERE claim_id=?",
        method,
        actor,
        Date.now(),
        id,
      );
      if (approve) {
        this.run(
          "UPDATE credentials SET verified=1 WHERE account_id=?",
          c.account_id,
        );
        // Relatives proposed while the identity was unverified get a full objection window from now.
        if (c.relationship === "self")
          this.run(
            "UPDATE proposals SET due=? WHERE author=? AND anchor=? AND status='pending' AND json_extract(payload,'$.relative')=1",
            this.now() + 7 * DAY,
            c.account_id,
            c.person_id,
          );
        if (c.relationship === "guardian") {
          const p = this.privacy(c.person_id);
          this.run(
            "INSERT OR REPLACE INTO profile_privacy VALUES(?,?,?,?,?,?,?,?)",
            c.person_id,
            "private",
            "child",
            "private",
            p.email,
            p.phone,
            p.city,
            Date.now(),
          );
        }
      } else {
        // A declined self-submitted profile with no other steward or link is retired, so it cannot linger as a duplicate.
        const p = this.one("SELECT kind,proposal_id FROM people WHERE id=?", c.person_id);
        if (
          p?.kind === "community" &&
          !p.proposal_id &&
          !this.one("SELECT id FROM claims WHERE person_id=? AND status IN ('pending','approved')", c.person_id) &&
          !this.one("SELECT id FROM relationships WHERE active=1 AND (a=? OR b=?)", c.person_id, c.person_id)
        )
          this.run("UPDATE people SET active=0 WHERE id=?", c.person_id);
      }
      this.log(
        actor,
        approve ? "claim_approved" : "claim_rejected",
        c.person_id,
        { claim: id, method, reason: text(reason) },
      );
      this.notify(
        c.account_id,
        null,
        approve
          ? "Your family connection was verified. You can now contribute."
          : "Your verification request was declined: " + text(reason),
      );
    });
  }
  revokeVerification(actor, account, reason) {
    this.admin(actor);
    need(
      actor !== account,
      "A separate administrator must review your own access.",
      403,
    );
    need(
      text(reason).length >= 15,
      "Record the reason for revoking verification.",
    );
    need(
      this.user(account).role !== "admin",
      "Administrator access must be resolved separately.",
      409,
    );
    this.transaction(() => {
      this.run("UPDATE credentials SET verified=0 WHERE account_id=?", account);
      this.run(
        "UPDATE claims SET status='revoked',decision=? WHERE account_id=? AND status='approved'",
        text(reason),
        account,
      );
      this.run("DELETE FROM member_sessions WHERE account_id=?", account);
      this.log(actor, "verification_revoked", account, {
        reason: text(reason),
      });
      this.notify(
        account,
        null,
        "Your family verification was revoked. Contact an administrator.",
      );
    });
  }
  savePrivacy(actor, id, input) {
    this.user(actor);
    need(
      !this.one("SELECT person_id FROM privacy_holds WHERE person_id=?", id) ||
        (input.audience === "private" && input.contactAudience === "private"),
      "An administrator must resolve the privacy hold before sharing can be enabled.",
      409,
    );
    const c = this.one(
      "SELECT v.relationship FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.account_id=? AND c.person_id=? AND c.status='approved'",
      actor,
      id,
    );
    need(
      c && ["self", "guardian"].includes(c.relationship),
      "Only the verified person or guardian may manage sharing.",
      403,
    );
    need(
      ["private", "verified", "public"].includes(input.audience) &&
        ["private", "verified"].includes(input.contactAudience),
      "Choose a valid visibility setting.",
    );
    // Publishing in the anonymous family tree needs the adult's own explicit consent; contacts are never public.
    need(
      input.audience !== "public" ||
        (c.relationship === "self" && input.life === "adult" && input.publicConsent === true),
      "Only an adult managing their own profile can consent to appear in the public family tree.",
    );
    need(
      ["adult", "child", "deceased", "unknown"].includes(input.life),
      "Choose a life stage.",
    );
    const old = this.privacy(id);
    need(
      !(old.life === "child" && input.life !== "child"),
      "Ask an administrator to review a child-to-adult correction.",
      409,
    );
    need(
      input.life !== "child" ||
        (input.audience === "private" && input.contactAudience === "private"),
      "Children remain private; their contact details cannot be shared.",
    );
    need(
      input.contactAudience !== "verified" ||
        (input.life === "adult" &&
          ["verified", "public"].includes(input.audience) &&
          c.relationship === "self" &&
          input.contactConsent === true),
      "Only an adult sharing their own profile may consent to sharing contact details.",
    );
    need(
      input.audience === "private" || input.profileConsent === true,
      "Confirm consent to share your profile with verified members.",
    );
    const email = text(input.email, 254),
      phone = text(input.phone, 40),
      city = text(input.city, 120);
    need(
      !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      "Enter a valid email address or leave it blank.",
    );
    this.transaction(() => {
      this.run(
        "INSERT OR REPLACE INTO profile_privacy VALUES(?,?,?,?,?,?,?,?)",
        id,
        input.audience,
        input.life,
        input.contactAudience,
        email,
        phone,
        city,
        Date.now(),
      );
      this.log(actor, "privacy_changed", id, {
        audience: input.audience,
        life: input.life,
        contactAudience: input.contactAudience,
        profileConsent: input.profileConsent === true,
        publicConsent: input.publicConsent === true,
        contactConsent: input.contactConsent === true,
      });
    });
  }
  releaseRestriction(actor, id, reason) {
    this.admin(actor);
    need(
      text(reason).length >= 15,
      "Record how the privacy concern was resolved.",
    );
    this.run("DELETE FROM privacy_holds WHERE person_id=?", id);
    this.log(actor, "privacy_hold_released", id, { reason: text(reason) });
  }
  restrict(actor, id, reason) {
    this.admin(actor);
    need(
      this.person(id) && text(reason).length >= 15,
      "Select a profile and record a restriction reason.",
    );
    const p = this.privacy(id);
    this.run(
      "INSERT OR REPLACE INTO profile_privacy VALUES(?,?,?,?,?,?,?,?)",
      id,
      "private",
      p.life,
      "private",
      p.email,
      p.phone,
      p.city,
      Date.now(),
    );
    this.run(
      "INSERT OR REPLACE INTO privacy_holds VALUES(?,?)",
      id,
      text(reason),
    );
    this.log(actor, "profile_restricted", id, { reason: text(reason) });
  }
  propose(actor, id, payload) {
    need(this.verified(actor), "Family verification is required.", 403);
    this.requireVisible(actor, id);
    for (const p of [payload.existingId, payload.secondId].filter(Boolean))
      this.requireVisible(actor, p);
    return super.propose(actor, id, payload);
  }
  canReview(actor, p) {
    if (this.user(actor).role === "admin" || p.author === actor) return true;
    const payload =
      typeof p.payload === "string" ? JSON.parse(p.payload) : p.payload;
    return [p.anchor, payload.existingId, payload.secondId]
      .filter(Boolean)
      .some((id) => this.owns(actor, id));
  }
  object(actor, id, reason) {
    const p = this.one("SELECT * FROM proposals WHERE id=?", id);
    need(p && this.canReview(actor, p), "Proposal not available.", 404);
    return super.object(actor, id, reason);
  }
  saveIntroduction(actor, input) {
    this.user(actor);
    const values = ["about_hi", "about_en", "family_hi", "family_en"].map(key => {
      need(typeof input[key] === "string" && input[key].length <= 3000,
        "Each introduction must contain at most 3000 characters.");
      return input[key].trim();
    });
    this.transaction(() => {
      this.run("INSERT OR REPLACE INTO account_introductions VALUES(?,?,?,?,?,?)",
        actor, ...values, Date.now());
      // Audit the change without duplicating private biography text in logs.
      this.log(actor, "private_introduction_saved", actor, {});
    });
  }
  memberState(actor) {
    const a = this.user(actor),
      credentials = this.one(
        "SELECT handle,verified FROM credentials WHERE account_id=?",
        actor,
      );
    const claims = this.all(
      `SELECT c.*,p.name AS person_name,p.village AS person_village,p.kind AS person_kind,p.generation AS person_generation,
        (SELECT f.name FROM relationships r JOIN people f ON f.id=r.a WHERE r.b=c.person_id AND r.type='parent' AND r.active=1 ORDER BY CASE r.role WHEN 'father' THEN 0 ELSE 1 END LIMIT 1) AS person_parent,
        a.name AS account_name,v.relationship,v.method,x.search_name,x.search_village,x.search_parent,x.candidates,x.similar
       FROM claims c JOIN people p ON p.id=c.person_id JOIN accounts a ON a.id=c.account_id JOIN verification_details v ON v.claim_id=c.id LEFT JOIN claim_context x ON x.claim_id=c.id
       WHERE ?='admin' OR c.account_id=? ORDER BY c.created DESC`,
      a.role,
      actor,
    ).map(({ similar, candidates, ...c }) =>
      // Similar-entry counts can include private people, so only reviewers see them.
      a.role === "admin" ? { ...c, candidates, similar: JSON.parse(similar || "[]").length } : c,
    );
    const selfClaim = this.personalClaim(actor);
    const own = this.all(
      "SELECT DISTINCT p.* FROM people p JOIN claims c ON c.person_id=p.id WHERE c.account_id=? AND c.status='approved' AND p.active=1",
      actor,
    ).map((p) => ({
      ...this.safePerson(actor, p),
      settings: this.privacy(p.id),
      relationship: claims.find(
        (c) => c.person_id === p.id && c.status === "approved",
      )?.relationship,
    }));
    const proposals = this.all(
      "SELECT p.*,a.name AS author_name FROM proposals p JOIN accounts a ON a.id=p.author ORDER BY created DESC LIMIT 100",
    )
      .filter((p) => this.canReview(actor, p))
      .map((p) => ({
        ...p,
        payload: JSON.parse(p.payload),
        anchor_name: this.person(p.anchor)?.name || "",
        // The author can pass this code privately to the added adult so they can claim their own entry.
        person_code:
          p.person_id && (p.author === actor || a.role === "admin")
            ? this.one("SELECT public_code FROM people WHERE id=? AND active=1", p.person_id)?.public_code || null
            : null,
        identity_verified: !!this.one(
          "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.account_id=? AND c.person_id=? AND c.status='approved' AND v.relationship='self'",
          p.author,
          p.anchor,
        ),
        objections: this.all(
          "SELECT reason,created FROM objections WHERE proposal_id=?",
          p.id,
        ),
      }));
    return {
      actor: {
        ...a,
        handle: credentials.handle,
        verified: !!credentials.verified,
      },
      // Node-claim onboarding stays required until the account has a pending or approved self claim.
      onboarding: { required: !selfClaim, claim: selfClaim || null },
      introduction: this.one("SELECT about_hi,about_en,family_hi,family_en,updated FROM account_introductions WHERE account_id=?", actor),
      canConfirmOwnNode: selfClaim?.status === "pending" && this.isOriginalOwner(actor),
      recoveryOwner: !!this.one("SELECT id FROM audit WHERE actor=? AND action='account_registered' AND json_extract(detail,'$.bootstrap')=1",actor) && a.role==='admin',
      recoveryRequests: a.role==='admin' && this.one("SELECT id FROM audit WHERE actor=? AND action='account_registered' AND json_extract(detail,'$.bootstrap')=1",actor) ? this.all("SELECT r.id,r.note,r.created,a.name,c.handle FROM recovery_requests r JOIN accounts a ON a.id=r.account_id JOIN credentials c ON c.account_id=a.id WHERE status='pending'") : [],
      claims,
      own,
      proposals,
      notifications: this.all(
        "SELECT id,body,created FROM notifications WHERE account_id=? ORDER BY created DESC LIMIT 30",
        actor,
      ),
      invitations:
        a.role === "admin"
          ? this.all(
              "SELECT hash AS id,label,expires,used_by,revoked FROM invitations ORDER BY expires DESC LIMIT 50",
            )
          : [],
      members:
        a.role === "admin"
          ? this.all(
              "SELECT a.id,a.name,a.role,c.handle,c.verified FROM accounts a JOIN credentials c ON c.account_id=a.id",
            )
          : [],
      audit:
        a.role === "admin"
          ? this.all(
              "SELECT id,action,created,entity FROM audit ORDER BY id DESC LIMIT 30",
            )
          : [],
    };
  }
}
let singleton;
export const getMembers = () => (singleton ??= new MemberStore(memberDbPath()));
