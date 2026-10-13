import { NextRequest, NextResponse } from "next/server";
import { getMembers } from "../../../lib/members.mjs";
import { Problem } from "../../../lib/store.mjs";
import { localGuard, secureSession } from "../../../lib/guard.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const COOKIE = "luhach_member_session";
const response = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      Vary: "Cookie",
      "Referrer-Policy": "no-referrer",
    },
  });
function fail(e: unknown) {
  if (e instanceof Problem) return response({ error: e.message }, e.status);
  console.error("Member request failed");
  return response({ error: "The request could not be completed." }, 500);
}
function signedIn(req: NextRequest) {
  const db = getMembers(),
    actor = db.actor(req.cookies.get(COOKIE)?.value);
  if (!actor) throw new Problem("Sign in to continue.", 401);
  return { db, actor };
}
function signedResponse(result: { token: string; recovery?: string }) {
  const r = response({ ok: true, recovery: result.recovery });
  r.cookies.set(COOKIE, result.token, {
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    maxAge: 86400,
    secure: secureSession(),
  });
  return r;
}
export async function GET(req: NextRequest) {
  try {
    localGuard(req, process.env.LUHACH_LOCAL_PREVIEW);
    const action = req.nextUrl.searchParams.get("action") || "session";
    if (action === "session") {
      const db = getMembers();
      return response({
        actor: db.actor(req.cookies.get(COOKIE)?.value),
        setupNeeded: !db.one("SELECT account_id FROM credentials LIMIT 1"),
      });
    }
    const { db, actor } = signedIn(req);
    db.tick();
    if (action === "search")
      return response({
        people: db.searchFor(actor.id, req.nextUrl.searchParams.get("q") || ""),
      });
    if (action === "family")
      return response(
        db.familyFor(actor.id, req.nextUrl.searchParams.get("id") || ""),
      );
    if (action === "state") return response(db.memberState(actor.id));
    if (action === "tree")
      return response(db.memberTree(actor.id, req.nextUrl.searchParams.get("focus") || ""));
    if (action === "candidates") {
      const q = req.nextUrl.searchParams;
      return response(
        db.claimCandidates(actor.id, {
          name: q.get("name") || "",
          village: q.get("village") || "",
          parent: q.get("parent") || "",
          code: q.get("code") || "",
        }),
      );
    }
    throw new Problem("Unknown request");
  } catch (e) {
    return fail(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    localGuard(req, process.env.LUHACH_LOCAL_PREVIEW, true);
    const raw = await req.text();
    if (raw.length > 16000) throw new Problem("Request too large", 413);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      throw new Problem("Invalid request");
    }
    const db = getMembers();
    if (b.action === "requestRecovery") { db.requestRecovery(b.username,b.note); return response({ok:true}); }
    if (b.action === "register" || b.action === "setup") {
      const result = await db.register(b, b.action === "setup");
      db.logout(req.cookies.get(COOKIE)?.value);
      return signedResponse(result);
    }
    if (b.action === "signin") {
      const result = await db.authenticate(b.username, b.password);
      db.logout(req.cookies.get(COOKIE)?.value);
      return signedResponse(result);
    }
    if (b.action === "recover")
      return signedResponse(await db.recover(b.username, b.code, b.password));
    if (b.action === "logout") {
      db.logout(req.cookies.get(COOKIE)?.value);
      const r = response({ ok: true });
      r.cookies.delete(COOKIE);
      return r;
    }
    const { actor } = signedIn(req);
    db.tick();
    let result = {};
    switch (b.action) {
      case "saveRecoveryCopy": db.saveRecoveryCopy(actor.id,b.code); break;
      case "recoveryCopies": result={copies:db.recoveryCopies(actor.id)}; break;
      case "issueRecovery": result=db.issueRecovery(actor.id,b.id,b.reason); break;
      case "saveIntroduction":
        db.saveIntroduction(actor.id, b);
        break;
      case "appointReviewer":
        await db.appointReviewer(actor.id, b.id, b.currentPassword, b.reason);
        break;
      case "invite":
        result = db.invite(actor.id, b.label);
        break;
      case "revokeInvite":
        db.revokeInvite(actor.id, b.id);
        break;
      case "claim":
        db.requestClaim(actor.id, b.id, b.reason, b.relationship);
        break;
      case "claimNode":
        db.requestNodeClaim(actor.id, b);
        break;
      case "createProfile":
        // The route always uses the duplicate-checked onboarding path for a missing person.
        db.requestNewProfile(actor.id, b);
        break;
      case "proposeRelative":
        db.proposeRelative(actor.id, b);
        break;
      case "verify":
        db.verifyClaim(actor.id, b.id, b.approve === true, b.reason, b.method);
        break;
      case "revokeVerification":
        db.revokeVerification(actor.id, b.id, b.reason);
        break;
      case "privacy":
        db.savePrivacy(actor.id, b.id, b);
        break;
      case "releaseRestriction":
        db.releaseRestriction(actor.id, b.id, b.reason);
        break;
      case "restrict":
        db.restrict(actor.id, b.id, b.reason);
        break;
      case "propose":
        db.propose(actor.id, b.id, b.payload);
        break;
      case "object":
        db.object(actor.id, b.id, b.reason);
        break;
      case "decide":
        db.decide(actor.id, b.id, b.decision, b.reason);
        break;
      case "password":
        return signedResponse(
          await db.changePassword(actor.id, b.currentPassword, b.password),
        );
      case "logoutAll":
        db.run("DELETE FROM member_sessions WHERE account_id=?", actor.id);
        {
          const r = response({ ok: true });
          r.cookies.delete(COOKIE);
          return r;
        }
      default:
        throw new Problem("Unknown action");
    }
    return response({ ok: true, ...result });
  } catch (e) {
    return fail(e);
  }
}
