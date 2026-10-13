import { MemberStore } from "./members.mjs";
import { Problem } from "./store.mjs";
import { memberDbPath } from "./storage.mjs";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
const need = (ok, msg, status = 400) => {
  if (!ok) throw new Problem(msg, status);
};
const clean = (s, n = 1000) =>
  String(s ?? "")
    .trim()
    .slice(0, n);
const DAY = 86400000;
export class HubStore extends MemberStore {
  constructor(path) {
    super(path);
    this.db.exec(`
 CREATE TABLE IF NOT EXISTS contributions(id TEXT PRIMARY KEY,author TEXT NOT NULL REFERENCES accounts(id),kind TEXT NOT NULL,title TEXT NOT NULL,village TEXT NOT NULL,person_id TEXT,body TEXT NOT NULL,source TEXT NOT NULL,media_id TEXT,status TEXT NOT NULL,created INTEGER NOT NULL,due INTEGER NOT NULL,decision TEXT);
 CREATE TABLE IF NOT EXISTS content_objections(id TEXT PRIMARY KEY,item TEXT NOT NULL REFERENCES contributions(id),author TEXT NOT NULL REFERENCES accounts(id),reason TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS media(id TEXT PRIMARY KEY,owner TEXT NOT NULL REFERENCES accounts(id),filename TEXT NOT NULL,mime TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS directory(account_id TEXT PRIMARY KEY REFERENCES accounts(id),person_id TEXT NOT NULL REFERENCES people(id),city TEXT NOT NULL,state TEXT NOT NULL,country TEXT NOT NULL,enabled INTEGER NOT NULL,updated INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS connections(id TEXT PRIMARY KEY,sender TEXT NOT NULL REFERENCES accounts(id),recipient TEXT NOT NULL REFERENCES accounts(id),status TEXT NOT NULL,note TEXT NOT NULL,created INTEGER NOT NULL,UNIQUE(sender,recipient));
 CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY,connection_id TEXT NOT NULL REFERENCES connections(id),sender TEXT NOT NULL REFERENCES accounts(id),body TEXT NOT NULL,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS blocks(owner TEXT NOT NULL REFERENCES accounts(id),target TEXT NOT NULL REFERENCES accounts(id),PRIMARY KEY(owner,target));
 CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY,reporter TEXT NOT NULL REFERENCES accounts(id),connection_id TEXT NOT NULL REFERENCES connections(id),message_id TEXT,reason TEXT NOT NULL,status TEXT NOT NULL,decision TEXT,created INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS transfers(id TEXT PRIMARY KEY,claim_id TEXT NOT NULL REFERENCES claims(id),author TEXT NOT NULL REFERENCES accounts(id),recipient TEXT NOT NULL REFERENCES accounts(id),reason TEXT NOT NULL,status TEXT NOT NULL,created INTEGER NOT NULL);
 `);
  }
  requireVerified(a) {
    need(this.verified(a), "Family verification is required.", 403);
  }
  contentVisible(a, c) {
    return (
      !c.person_id ||
      !!(this.person(c.person_id) && this.visible(a, c.person_id))
    );
  }
  content(a) {
    this.requireVerified(a);
    return this.all(
      "SELECT c.*,a.name AS author_name FROM contributions c JOIN accounts a ON a.id=c.author ORDER BY created DESC LIMIT 500",
    )
      .filter(
        (c) =>
          (c.status === "accepted" ||
            c.status === "pending" ||
            c.status === "disputed" ||
            c.author === a ||
            this.user(a).role === "admin") &&
          this.contentVisible(a, c),
      )
      .map((c) => ({
        ...c,
        objections: this.all(
          "SELECT reason,created FROM content_objections WHERE item=?",
          c.id,
        ),
      }));
  }
  contribute(a, b) {
    this.requireVerified(a);
    need(
      ["village", "biography", "photo"].includes(b.kind),
      "Choose a contribution type.",
    );
    need(
      clean(b.title, 160).length >= 4 &&
        clean(b.body, 12000).length >= 20 &&
        clean(b.source, 1000).length >= 10,
      "Add a title, description and a source or first-hand explanation.",
    );
    need(b.consent === true, "Confirm that you may share this material.");
    if (b.person_id) {
      this.requireVisible(a, b.person_id);
      const p = this.privacy(b.person_id);
      need(
        p.life === "deceased" || this.owns(a, b.person_id),
        "A living person’s biography needs their approved steward.",
        403,
      );
      need(
        p.life !== "child",
        "Children’s biographies are not shared here.",
        403,
      );
    }
    need(
      b.kind !== "biography" || b.person_id,
      "Select the family profile for a biography.",
    );
    if (b.media_id)
      need(
        this.one("SELECT id FROM media WHERE id=? AND owner=?", b.media_id, a),
        "Upload not available.",
      );
    need(b.kind !== "photo" || b.media_id, "Choose a photograph.");
    need(
      this.one(
        "SELECT COUNT(*) n FROM contributions WHERE author=? AND created>?",
        a,
        this.now() - DAY,
      ).n < 20,
      "Daily contribution limit reached.",
      429,
    );
    const id = randomUUID();
    this.transaction(() => {
      this.run(
        "INSERT INTO contributions VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NULL)",
        id,
        a,
        b.kind,
        clean(b.title, 160),
        clean(b.village, 120),
        b.person_id || null,
        clean(b.body, 12000),
        clean(b.source),
        b.media_id || null,
        "pending",
        this.now(),
        this.now() + 7 * DAY,
      );
      this.log(a, "content_submitted", id, { kind: b.kind });
    });
    return { id };
  }
  tick() {
    super.tick();
    if (!this.one("SELECT name FROM sqlite_master WHERE name='contributions'"))
      return;
    this.transaction(() => {
      for (const c of this.all(
        "SELECT * FROM contributions WHERE status='pending' AND due<=?",
        this.now(),
      )) {
        const allowed =
          this.verified(c.author) &&
          !this.one("SELECT id FROM content_objections WHERE item=?", c.id) &&
          (!c.person_id || this.privacy(c.person_id).life !== "child");
        this.run(
          "UPDATE contributions SET status=?,decision=? WHERE id=?",
          allowed ? "accepted" : "disputed",
          allowed
            ? "No objection received during the seven-day review window."
            : "A steward must review this contribution.",
          c.id,
        );
        this.log("system", "content_review_window", c.id, {
          accepted: allowed,
        });
      }
    });
  }
  reviewContent(a, b) {
    this.requireVerified(a);
    const c = this.one("SELECT * FROM contributions WHERE id=?", b.id);
    need(c && this.contentVisible(a, c), "Contribution unavailable.", 404);
    const reason = clean(b.reason);
    need(reason.length >= 10, "Please explain the decision or objection.");
    if (b.action === "objectContent") {
      need(
        ["pending", "accepted"].includes(c.status),
        "This item is not open for objections.",
      );
      this.transaction(() => {
        this.run(
          "INSERT INTO content_objections VALUES(?,?,?,?,?)",
          randomUUID(),
          c.id,
          a,
          reason,
          this.now(),
        );
        this.run(
          "UPDATE contributions SET status='disputed',decision=NULL WHERE id=?",
          c.id,
        );
        this.log(a, "content_objected", c.id, {});
      });
      return;
    }
    if (b.action === "withdrawContent") {
      need(c.author === a, "Only the author may withdraw.", 403);
      this.run(
        "UPDATE contributions SET status='withdrawn',decision=? WHERE id=?",
        reason,
        c.id,
      );
    } else {
      this.admin(a);
      need(
        c.author !== a,
        "Another administrator must review your own contribution.",
        403,
      );
      need(
        ["accepted", "rejected", "removed"].includes(b.status),
        "Invalid decision.",
      );
      need(
        b.status !== "accepted" ||
          !c.person_id ||
          this.privacy(c.person_id).life !== "child",
        "A child’s profile cannot be published.",
      );
      this.run(
        "UPDATE contributions SET status=?,decision=? WHERE id=?",
        b.status,
        reason,
        c.id,
      );
    }
    this.log(a, "content_decided", c.id, {
      status: b.status || "withdrawn",
      reason,
    });
  }
  selfClaim(a, p) {
    return this.one(
      "SELECT c.id FROM claims c JOIN verification_details v ON v.claim_id=c.id WHERE c.account_id=? AND c.person_id=? AND c.status='approved' AND v.relationship='self'",
      a,
      p,
    );
  }
  eligible(a) {
    const d = this.one(
      "SELECT * FROM directory WHERE account_id=? AND enabled=1",
      a,
    );
    return d &&
      this.verified(a) &&
      this.selfClaim(a, d.person_id) &&
      this.privacy(d.person_id).life === "adult" &&
      ["verified","public"].includes(this.privacy(d.person_id).audience) &&
      !this.one(
        "SELECT person_id FROM privacy_holds WHERE person_id=?",
        d.person_id,
      )
      ? d
      : null;
  }
  blocked(a, b) {
    return !!this.one(
      "SELECT owner FROM blocks WHERE (owner=? AND target=?) OR (owner=? AND target=?)",
      a,
      b,
      b,
      a,
    );
  }
  saveDirectory(a, b) {
    this.requireVerified(a);
    if (!b.enabled) {
      this.run(
        "UPDATE directory SET enabled=0,updated=? WHERE account_id=?",
        this.now(),
        a,
      );
      return;
    }
    need(
      this.selfClaim(a, b.person_id) &&
        this.privacy(b.person_id).life === "adult" &&
        ["verified","public"].includes(this.privacy(b.person_id).audience) &&
        !this.one(
          "SELECT person_id FROM privacy_holds WHERE person_id=?",
          b.person_id,
        ),
      "Only your verified, shared adult self-profile may appear in the directory.",
      403,
    );
    need(
      b.consent === true && clean(b.city, 80) && clean(b.country, 80),
      "Confirm consent and enter a city and country.",
    );
    this.run(
      "INSERT INTO directory VALUES(?,?,?,?,?,?,?) ON CONFLICT(account_id) DO UPDATE SET person_id=excluded.person_id,city=excluded.city,state=excluded.state,country=excluded.country,enabled=excluded.enabled,updated=excluded.updated",
      a,
      b.person_id,
      clean(b.city, 80),
      clean(b.state, 80),
      clean(b.country, 80),
      1,
      this.now(),
    );
    this.log(a, "directory_consent", a, { enabled: true });
  }
  findMembers(a, q = "") {
    this.requireVerified(a);
    const term = clean(q, 100).toLocaleLowerCase();
    return this.all(
      "SELECT d.*,a.name FROM directory d JOIN accounts a ON a.id=d.account_id WHERE enabled=1",
    )
      .filter(
        (d) =>
          d.account_id !== a &&
          this.eligible(d.account_id) &&
          !this.blocked(a, d.account_id) &&
          `${d.name} ${d.city} ${d.state} ${d.country}`
            .toLocaleLowerCase()
            .includes(term),
      )
      .slice(0, 60)
      .map(({ account_id, name, city, state, country }) => ({
        id: account_id,
        name,
        city,
        state,
        country,
      }));
  }
  connect(a, b) {
    this.requireVerified(a);
    need(
      this.eligible(a) &&
        this.eligible(b.target) &&
        a !== b.target &&
        !this.blocked(a, b.target),
      "Both members must opt into connections.",
      403,
    );
    need(clean(b.note).length >= 10, "Introduce yourself in a short note.");
    need(
      !this.one(
        "SELECT id FROM connections WHERE ((sender=? AND recipient=?) OR (sender=? AND recipient=?)) AND status IN ('pending','accepted')",
        a,
        b.target,
        b.target,
        a,
      ),
      "A connection already exists.",
    );
    need(
      this.one(
        "SELECT COUNT(*) n FROM connections WHERE sender=? AND created>?",
        a,
        this.now() - DAY,
      ).n < 10,
      "Daily request limit reached.",
      429,
    );
    this.run(
      "INSERT INTO connections VALUES(?,?,?,?,?,?) ON CONFLICT(sender,recipient) DO UPDATE SET status=excluded.status,note=excluded.note,created=excluded.created",
      randomUUID(),
      a,
      b.target,
      "pending",
      clean(b.note),
      this.now(),
    );
  }
  connection(a, id) {
    const c = this.one(
      "SELECT * FROM connections WHERE id=? AND (sender=? OR recipient=?)",
      id,
      a,
      a,
    );
    need(c, "Conversation unavailable.", 404);
    return c;
  }
  decideConnection(a, b) {
    const c = this.connection(a, b.id);
    need(
      ["accepted", "declined", "closed"].includes(b.status),
      "Invalid response.",
    );
    need(
      b.status === "closed" || (c.recipient === a && c.status === "pending"),
      "Only the recipient can answer a pending request.",
      403,
    );
    if (b.status === "accepted")
      need(
        this.eligible(a) &&
          this.eligible(c.sender) &&
          !this.blocked(c.sender, c.recipient),
        "Connection no longer available.",
        403,
      );
    this.run("UPDATE connections SET status=? WHERE id=?", b.status, c.id);
  }
  conversations(a) {
    this.requireVerified(a);
    return this.all(
      "SELECT c.*,a.name sender_name,b.name recipient_name FROM connections c JOIN accounts a ON a.id=c.sender JOIN accounts b ON b.id=c.recipient WHERE c.sender=? OR c.recipient=? ORDER BY c.created DESC",
      a,
      a,
    ).map((c) => ({
      ...c,
      blocked: this.blocked(c.sender, c.recipient),
      available: !!(this.eligible(c.sender) && this.eligible(c.recipient)),
      messages:
        c.status === "accepted" &&
        !this.blocked(c.sender, c.recipient) &&
        this.eligible(c.sender) &&
        this.eligible(c.recipient)
          ? this.all(
              "SELECT id,sender,body,created FROM (SELECT * FROM messages WHERE connection_id=? ORDER BY created DESC LIMIT 100) ORDER BY created",
              c.id,
            )
          : [],
    }));
  }
  sendMessage(a, b) {
    this.requireVerified(a);
    const c = this.connection(a, b.id);
    need(
      c.status === "accepted" &&
        !this.blocked(c.sender, c.recipient) &&
        this.eligible(c.sender) &&
        this.eligible(c.recipient),
      "This conversation is not available.",
      403,
    );
    need(clean(b.body, 3000), "Write a message.");
    need(
      this.one(
        "SELECT COUNT(*) n FROM messages WHERE sender=? AND created>?",
        a,
        this.now() - 60000,
      ).n < 20,
      "Please wait before sending more messages.",
      429,
    );
    this.run(
      "INSERT INTO messages VALUES(?,?,?,?,?)",
      randomUUID(),
      c.id,
      a,
      clean(b.body, 3000),
      this.now(),
    );
  }
  block(a, target, enabled = true) {
    this.requireVerified(a);
    need(
      target !== a && this.one("SELECT id FROM accounts WHERE id=?", target),
      "Member unavailable.",
    );
    if (enabled)
      this.transaction(() => {
        this.run("INSERT OR IGNORE INTO blocks VALUES(?,?)", a, target);
        this.run(
          "UPDATE connections SET status='closed' WHERE (sender=? AND recipient=?) OR (sender=? AND recipient=?)",
          a,
          target,
          target,
          a,
        );
      });
    else this.run("DELETE FROM blocks WHERE owner=? AND target=?", a, target);
  }
  report(a, b) {
    this.requireVerified(a);
    const c = this.connection(a, b.id);
    need(clean(b.reason).length >= 10, "Explain the concern.");
    if (b.message_id)
      need(
        this.one(
          "SELECT id FROM messages WHERE id=? AND connection_id=?",
          b.message_id,
          c.id,
        ),
        "Message unavailable.",
      );
    this.run(
      "INSERT INTO reports VALUES(?,?,?,?,?,?,NULL,?)",
      randomUUID(),
      a,
      c.id,
      b.message_id || null,
      clean(b.reason),
      "open",
      this.now(),
    );
  }
  reportsFor(a) {
    this.admin(a);
    return this.all(
      "SELECT r.*,m.body AS reported_message FROM reports r LEFT JOIN messages m ON m.id=r.message_id ORDER BY r.created DESC LIMIT 100",
    );
  }
  resolveReport(a, b) {
    this.admin(a);
    need(clean(b.reason).length >= 10, "Explain how the report was resolved.");
    need(
      this.one("SELECT id FROM reports WHERE id=?", b.id),
      "Report unavailable.",
      404,
    );
    this.run(
      "UPDATE reports SET status='resolved',decision=? WHERE id=?",
      clean(b.reason),
      b.id,
    );
    this.log(a, "report_resolved", b.id, { reason: clean(b.reason) });
  }
  lineage(a, from, to) {
    this.requireVerified(a);
    this.requireVisible(a, from);
    this.requireVisible(a, to);
    const seen = new Set([from]),
      queue = [{ id: from, path: [] }];
    for (let i = 0; i < queue.length && i < 10000; i++) {
      const n = queue[i];
      if (n.id === to)
        return {
          found: true,
          from: this.safePerson(a, this.person(from)),
          steps: n.path,
        };
      if (n.path.length >= 20) continue;
      for (const e of this.all(
        "SELECT * FROM relationships WHERE active=1 AND (a=? OR b=?)",
        n.id,
        n.id,
      )) {
        const next = e.a === n.id ? e.b : e.a;
        if (seen.has(next) || !this.person(next) || !this.visible(a, next))
          continue;
        seen.add(next);
        queue.push({
          id: next,
          path: [
            ...n.path,
            {
              person: this.safePerson(a, this.person(next)),
              relation:
                e.type === "spouse"
                  ? "spouse"
                  : e.a === n.id
                    ? "child"
                    : e.role || "parent",
              source: e.proposal_id && this.user(a).role!=='admin' && !this.owns(a,e.a) && !this.owns(a,e.b) ? 'Accepted community contribution; supporting evidence is restricted to stewards.' : e.source,
              record: e.id,
            },
          ],
        });
      }
    }
    return {
      found: false,
      message:
        "No visible path found within 20 links. Missing or private links are not inferred.",
    };
  }
  exportAccount(a) {
    this.user(a);
    const s = this.memberState(a);
    return {
      exported: new Date(this.now()).toISOString(),
      account: {
        actor: s.actor,
        own: s.own,
        claims: s.claims.filter((c) => c.account_id === a),
        proposals: s.proposals.filter((p) => p.author === a),
        notifications: s.notifications,
      },
      directory:
        this.one("SELECT * FROM directory WHERE account_id=?", a) || null,
      contributions: this.all("SELECT * FROM contributions WHERE author=?", a),
      sentMessages: this.all("SELECT m.* FROM messages m WHERE sender=?", a),
      note: "Only your own sent messages are exported. Password hashes, recovery secrets, other members’ private messages and administrator-only records are excluded.",
    };
  }
  async closeAccount(a, password) {
    this.user(a);
    need(
      this.user(a).role !== "admin",
      "Transfer administrator duties and ask another administrator to remove your admin role first.",
      403,
    );
    await this.authenticate(
      this.one("SELECT handle FROM credentials WHERE account_id=?", a).handle,
      password,
    );
    this.transaction(() => {
      need(this.user(a).role!=='admin','Administrator duties must be handed over before closing this account.',403);
      this.run("DELETE FROM member_sessions WHERE account_id=?", a);
      for (const c of this.all(
        "SELECT person_id FROM claims WHERE account_id=? AND status='approved'",
        a,
      ))
        this.run(
          "INSERT INTO profile_privacy(person_id,audience,life,contact_audience,updated) VALUES(?,'private','unknown','private',0) ON CONFLICT(person_id) DO UPDATE SET audience='private',contact_audience='private',email='',phone='',city=''",
          c.person_id,
        );
      this.run(
        "UPDATE claims SET status='revoked',decision='Account closed by member' WHERE account_id=? AND status IN ('pending','approved')",
        a,
      );
      this.run("DELETE FROM credentials WHERE account_id=?", a);
      this.run("DELETE FROM account_introductions WHERE account_id=?", a);
      this.run("DELETE FROM recovery_vault WHERE account_id=?", a);
      this.run("DELETE FROM recovery_requests WHERE account_id=?", a);
      this.run("UPDATE accounts SET name='Former member' WHERE id=?", a);
      this.run(
        "UPDATE directory SET enabled=0,city=?,state=?,country=? WHERE account_id=?",
        "",
        "",
        "",
        a,
      );
      this.run(
        "UPDATE connections SET status='closed' WHERE sender=? OR recipient=?",
        a,
        a,
      );
      this.run(
        "UPDATE contributions SET status='withdrawn',decision='Account closed' WHERE author=? AND status IN ('pending','disputed')",
        a,
      );
      this.run(
        "UPDATE proposals SET status='withdrawn',decision='Account closed' WHERE author=? AND status IN ('pending','disputed','conflict')",
        a,
      );
      this.log(a, "account_closed", a, {});
    });
  }
  requestTransfer(a, b) {
    this.requireVerified(a);
    const c = this.one(
      "SELECT * FROM claims WHERE id=? AND account_id=? AND status='approved'",
      b.claim,
      a,
    );
    need(c, "Stewardship unavailable.", 404);
    need(
      this.one(
        "SELECT verified FROM credentials WHERE account_id=? AND verified=1",
        b.target,
      ) && b.target !== a,
      "Choose another verified member.",
    );
    need(
      clean(b.reason).length >= 15,
      "Explain the transfer, consent and relationship.",
    );
    this.run(
      "INSERT INTO transfers VALUES(?,?,?,?,?,?,?)",
      randomUUID(),
      c.id,
      a,
      b.target,
      clean(b.reason),
      "pending",
      this.now(),
    );
  }
  reviewTransfer(a, b) {
    this.admin(a);
    const t = this.one(
      "SELECT * FROM transfers WHERE id=? AND status='pending'",
      b.id,
    );
    need(
      t && a !== t.author && a !== t.recipient,
      "An independent administrator must review this transfer.",
      403,
    );
    need(
      clean(b.reason).length >= 15,
      "Record evidence of consent and the new relationship.",
    );
    need(
      ["self", "guardian", "relative"].includes(b.relationship),
      "Choose the new stewardship relationship.",
    );
    this.transaction(() => {
      const c = this.one(
        "SELECT * FROM claims WHERE id=? AND status='approved'",
        t.claim_id,
      );
      need(c, "Original stewardship no longer active.");
      if (b.accept) {
        need(
          this.one(
            "SELECT verified FROM credentials WHERE account_id=? AND verified=1",
            t.recipient,
          ),
          "Recipient verification no longer active.",
        );
        const id = randomUUID();
        this.run(
          "INSERT INTO claims VALUES(?,?,?,?,?,?,?)",
          id,
          t.recipient,
          c.person_id,
          t.reason,
          "approved",
          this.now(),
          clean(b.reason),
        );
        this.run(
          "INSERT INTO verification_details VALUES(?,?,?,?,?)",
          id,
          b.relationship,
          "contacted_member",
          a,
          this.now(),
        );
        this.run(
          "UPDATE claims SET status='revoked',decision=? WHERE id=?",
          clean(b.reason),
          c.id,
        );
        this.run(
          "INSERT INTO profile_privacy(person_id,audience,life,contact_audience,updated) VALUES(?,'private',?,'private',?) ON CONFLICT(person_id) DO UPDATE SET audience='private',life=excluded.life,contact_audience='private'",
          c.person_id,
          b.relationship === "guardian"
            ? "child"
            : b.relationship === "self"
              ? "adult"
              : this.privacy(c.person_id).life,
          this.now(),
        );
      }
      this.run(
        "UPDATE transfers SET status=? WHERE id=?",
        b.accept ? "accepted" : "rejected",
        t.id,
      );
      this.log(a, "stewardship_transfer", c.person_id, {
        accepted: !!b.accept,
        reason: clean(b.reason),
      });
    });
  }
  async demoteAdmin(a, b) {
    this.admin(a);
    need(
      a !== b.target && this.user(b.target).role === "admin",
      "Choose another administrator.",
    );
    need(clean(b.reason).length >= 15, "Explain the change.");
    await this.authenticate(
      this.one("SELECT handle FROM credentials WHERE account_id=?", a).handle,
      b.password,
    );
    this.transaction(() => {
      this.admin(a);
      need(this.user(b.target).role==='admin','That administrator role has already changed.',409);
      this.run("UPDATE accounts SET role='member' WHERE id=?", b.target);
      this.run(
        "DELETE FROM member_sessions WHERE account_id IN (?,?)",
        a,
        b.target,
      );
      this.log(a, "admin_removed", b.target, { reason: clean(b.reason) });
    });
  }
  hubState(a) {
    this.requireVerified(a);
    return {
      directory:
        this.one("SELECT * FROM directory WHERE account_id=?", a) || null,
      conversations: this.conversations(a),
      blocked: this.all(
        "SELECT b.target,a.name FROM blocks b JOIN accounts a ON a.id=b.target WHERE owner=?",
        a,
      ),
      reports: this.user(a).role === "admin" ? this.reportsFor(a) : [],
      transfers:
        this.user(a).role === "admin"
          ? this.all("SELECT * FROM transfers ORDER BY created DESC")
          : this.all(
              "SELECT * FROM transfers WHERE author=? OR recipient=?",
              a,
              a,
            ),
      myClaims: this.all(
        "SELECT c.id,c.person_id,p.name,v.relationship FROM claims c JOIN people p ON p.id=c.person_id JOIN verification_details v ON v.claim_id=c.id WHERE c.account_id=? AND c.status='approved'",
        a,
      ),
    };
  }
}
export const mediaRoot=()=>process.env.LUHACH_MEMBER_DB?resolve(process.env.LUHACH_MEMBER_DB+'.media'):resolve('data/media');
let singleton;
export const getHub = () => (singleton ??= new HubStore(memberDbPath()));
