import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/session";
import { forceRerunDraw } from "@/lib/draw";

export async function POST() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  try {
    await forceRerunDraw();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "The draw failed to run." },
      { status: 500 }
    );
  }
  return NextResponse.json({ ok: true });
}
