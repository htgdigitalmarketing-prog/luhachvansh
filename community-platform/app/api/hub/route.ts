import { NextRequest, NextResponse } from "next/server";
import { getHub } from "../../../lib/hub.mjs";
import { Problem } from "../../../lib/store.mjs";
import { localGuard } from "../../../lib/guard.mjs";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const reply = (data: unknown, status = 200) =>
  NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store", Vary: "Cookie" },
  });
function actor(req: NextRequest) {
  localGuard(req, process.env.LUHACH_LOCAL_PREVIEW, req.method === "POST");
  const db = getHub(),
    a = db.actor(req.cookies.get("luhach_member_session")?.value);
  if (!a) throw new Problem("Sign in to continue.", 401);
  db.tick();
  return { db, a };
}
function failure(e: unknown) {
  return reply(
    {
      error:
        e instanceof Problem ? e.message : "Request could not be completed.",
    },
    e instanceof Problem ? e.status : 500,
  );
}
export async function GET(req: NextRequest) {
  try {
    const { db, a } = actor(req),
      q = req.nextUrl.searchParams;
    switch (q.get("action")) {
      case "content":
        return reply(db.content(a.id));
      case "directory":
        return reply(db.findMembers(a.id, q.get("q") || ""));
      case "lineage":
        return reply(db.lineage(a.id, q.get("from"), q.get("to")));
      case "export": {
        const data = db.exportAccount(a.id);
        data.account = {
          actor: data.account.actor,
          own: data.account.own,
          claims: data.account.claims.filter((c: any) => c.account_id === a.id),
          proposals: data.account.proposals.filter(
            (p: any) => p.author === a.id,
          ),
          notifications: data.account.notifications,
        };
        return reply(data);
      }
      default:
        return reply(db.hubState(a.id));
    }
  } catch (e) {
    return failure(e);
  }
}
export async function POST(req: NextRequest) {
  try {
    const { db, a } = actor(req);
    const raw = await req.text();
    if (raw.length > 20000) throw new Problem("Request too large.", 413);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      throw new Problem("Invalid request.");
    }
    let result;
    switch (b.action) {
      case "contribute":
        result = db.contribute(a.id, b);
        break;
      case "objectContent":
      case "reviewContent":
      case "withdrawContent":
        db.reviewContent(a.id, b);
        break;
      case "directory":
        db.saveDirectory(a.id, b);
        break;
      case "connect":
        db.connect(a.id, b);
        break;
      case "connection":
        db.decideConnection(a.id, b);
        break;
      case "message":
        db.sendMessage(a.id, b);
        break;
      case "block":
        db.block(a.id, b.target, b.enabled !== false);
        break;
      case "report":
        db.report(a.id, b);
        break;
      case "resolveReport":
        db.resolveReport(a.id, b);
        break;
      case "transfer":
        db.requestTransfer(a.id, b);
        break;
      case "reviewTransfer":
        db.reviewTransfer(a.id, b);
        break;
      case "demote":
        await db.demoteAdmin(a.id, b);
        break;
      case "close":
        await db.closeAccount(a.id, b.password);
        break;
      default:
        throw new Problem("Unknown request.");
    }
    return reply(result || { ok: true });
  } catch (e) {
    return failure(e);
  }
}
