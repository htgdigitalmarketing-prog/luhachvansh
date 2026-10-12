import {
  randomBytes,
  randomUUID,
  createHash,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { Store, Problem } from "./store.mjs";
const scrypt = promisify(scryptCallback),
  DAY = 86400000;
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
      password.length >= 15 &&
      password.length <= 128,
    "Use a password of 15–128 characters. Spaces are welcome.",
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
    this.db.exec(`
   CREATE TABLE IF NOT EXISTS credentials(account_id TEXT PRIMARY KEY REFERENCES accounts(id),handle TEXT NOT NULL UNIQUE,password_hash TEXT NOT NULL,recovery_hash TEXT NOT NULL,verified INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS invitations(hash TEXT PRIMARY KEY,label TEXT NOT NULL,created_by TEXT NOT NULL,expires INTEGER NOT NULL,used_by TEXT,revoked INTEGER NOT NULL DEFAULT 0);
   CREATE TABLE IF NOT EXISTS throttles(key TEXT PRIMARY KEY,count INTEGER NOT NULL,until INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS member_sessions(hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id),created INTEGER NOT NULL,last_seen INTEGER NOT NULL,expires INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS profile_privacy(person_id TEXT PRIMARY KEY REFERENCES people(id),audience TEXT NOT NULL DEFAULT 'private',life TEXT NOT NULL DEFAULT 'unknown',contact_audience TEXT NOT NULL DEFAULT 'private',email TEXT NOT NULL DEFAULT '',phone TEXT NOT NULL DEFAULT '',city TEXT NOT NULL DEFAULT '',updated INTEGER NOT NULL);
   CREATE TABLE IF NOT EXISTS privacy_holds(person_id TEXT PRIMARY KEY REFERENCES people(id),reason TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS verification_details(claim_id TEXT PRIMARY KEY REFERENCES claims(id),relationship TEXT NOT NULL,method TEXT,reviewer TEXT,reviewed INTEGER);
  `);
  }
  now() {
    return Date.now();
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
    return (
      this.verified(actor) && p.audience === "verified" && p.life !== "child"
    );
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
          return s.audience === "verified" && s.life !== "child";
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
  requestClaim(actor, id, reason, relationship) {
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
        policy.audience === "verified" &&
        policy.life !== "child") ||
        this.visible(actor, id) ||
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
      ["private", "verified"].includes(input.audience) &&
        ["private", "verified"].includes(input.contactAudience),
      "Choose a valid visibility setting.",
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
          input.audience === "verified" &&
          c.relationship === "self" &&
          input.contactConsent === true),
      "Only an adult sharing their own profile may consent to sharing contact details.",
    );
    need(
      input.audience !== "verified" || input.profileConsent === true,
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
  memberState(actor) {
    const a = this.user(actor),
      credentials = this.one(
        "SELECT handle,verified FROM credentials WHERE account_id=?",
        actor,
      );
    const claims = this.all(
      `SELECT c.*,p.name AS person_name,a.name AS account_name,v.relationship,v.method FROM claims c JOIN people p ON p.id=c.person_id JOIN accounts a ON a.id=c.account_id JOIN verification_details v ON v.claim_id=c.id WHERE ?='admin' OR c.account_id=? ORDER BY c.created DESC`,
      a.role,
      actor,
    );
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
export const getMembers = () =>
  (singleton ??= new MemberStore(
    process.env.LUHACH_MEMBER_DB || resolve("data/members.sqlite"),
  ));
