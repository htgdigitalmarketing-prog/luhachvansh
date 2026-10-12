import { NextRequest, NextResponse } from "next/server";
import { getHub } from "../../../lib/hub.mjs";
import {
  heritage,
  answerHistory,
  answerFamily,
} from "../../../lib/research.mjs";
import { localGuard } from "../../../lib/guard.mjs";
import { Problem } from "../../../lib/store.mjs";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const reply = (d: unknown, s = 200) =>
  NextResponse.json(d, {
    status: s,
    headers: { "Cache-Control": "no-store", Vary: "Cookie" },
  });
function access(req: NextRequest) {
  localGuard(req, process.env.LUHACH_LOCAL_PREVIEW, req.method === "POST");
  const db = getHub(),
    a = db.actor(req.cookies.get("luhach_member_session")?.value);
  if (!a) throw new Problem("Sign in first.", 401);
  db.requireVerified(a.id);
  return { db, a };
}
export async function GET(req: NextRequest) {
  try {
    access(req);
    return reply({
      villages: heritage,
      aiConfigured: !!process.env.GEMINI_API_KEY,
    });
  } catch (e) {
    return reply(
      { error: e instanceof Problem ? e.message : "Archive unavailable." },
      e instanceof Problem ? e.status : 500,
    );
  }
}
export async function POST(req: NextRequest) {
  try {
    const { db, a } = access(req);
    const raw = await req.text();
    if (raw.length > 2500) throw new Problem("Question too long.", 413);
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      throw new Problem("Invalid request.");
    }
    if (b.mode === "family") return reply(answerFamily(db, a.id, b));
    if (b.mode === "directory") {
      const people = db.findMembers(a.id, b.question);
      return reply({
        mode: "records",
        answer: people.length
          ? people
              .map(
                (p: any) =>
                  `${p.name} — ${[p.city, p.state, p.country].filter(Boolean).join(", ")}`,
              )
              .join("\n")
          : "No consenting member matched that city, state, country or name.",
        sources: [],
        notice:
          "Only the opt-in directory was searched. Open Find members to request a connection.",
      });
    }
    return reply(await answerHistory(db, a.id, b));
  } catch (e) {
    return reply(
      { error: e instanceof Problem ? e.message : "Research unavailable." },
      e instanceof Problem ? e.status : 500,
    );
  }
}
