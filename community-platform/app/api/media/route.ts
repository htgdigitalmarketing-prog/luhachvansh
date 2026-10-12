import { NextRequest, NextResponse } from "next/server";
import { getHub, mediaRoot } from "../../../lib/hub.mjs";
import { localGuard } from "../../../lib/guard.mjs";
import { Problem } from "../../../lib/store.mjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function access(req: NextRequest) {
  localGuard(req, process.env.LUHACH_LOCAL_PREVIEW, req.method === "POST");
  const db = getHub(),
    a = db.actor(req.cookies.get("luhach_member_session")?.value);
  if (!a) throw new Problem("Sign in first.", 401);
  db.requireVerified(a.id);
  return { db, a };
}
const fail = (e: unknown) =>
  NextResponse.json(
    {
      error:
        e instanceof Problem ? e.message : "The image could not be processed.",
    },
    {
      status: e instanceof Problem ? e.status : 400,
      headers: { "Cache-Control": "no-store" },
    },
  );
export async function POST(req: NextRequest) {
  try {
    const { db, a } = access(req);
    if (
      db.one(
        "SELECT COUNT(*) n FROM media WHERE owner=? AND created>?",
        a.id,
        Date.now() - 86400000,
      ).n >= 20
    )
      throw new Problem("Daily upload limit reached.", 429);
    const reader = req.body?.getReader();
    if (!reader) throw new Problem("Choose a photo.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const part = await reader.read();
      if (part.done) break;
      length += part.value.length;
      if (length > 8 * 1024 * 1024) {
        await reader.cancel();
        throw new Problem("Maximum photo size is 8 MB.", 413);
      }
      chunks.push(part.value);
    }
    const input = Buffer.concat(chunks);
    const info = await sharp(input, { limitInputPixels: 25000000 }).metadata();
    if (
      !["jpeg", "png", "webp"].includes(info.format || "") ||
      (info.pages || 1) > 1
    )
      throw new Problem("Use a single JPEG, PNG or WebP image.");
    const output = await sharp(input, { limitInputPixels: 25000000 })
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    const id = randomUUID();
    await mkdir(mediaRoot(), { recursive: true });
    await writeFile(resolve(mediaRoot(), id + ".webp"), output, {
      flag: "wx",
    });
    db.run(
      "INSERT INTO media VALUES(?,?,?,?,?)",
      id,
      a.id,
      id + ".webp",
      "image/webp",
      Date.now(),
    );
    return NextResponse.json(
      { id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return fail(e);
  }
}
export async function GET(req: NextRequest) {
  try {
    const { db, a } = access(req);
    const id = req.nextUrl.searchParams.get("id");
    const m = db.one("SELECT * FROM media WHERE id=?", id || "");
    if (!m) throw new Problem("Photo unavailable.", 404);
    if (
      m.owner !== a.id &&
      !db.content(a.id).some((c: any) => c.media_id === id)
    )
      throw new Problem("Photo unavailable.", 404);
    return new NextResponse(
      new Uint8Array(await readFile(resolve(mediaRoot(), m.filename))),
      {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (e) {
    return fail(e);
  }
}
