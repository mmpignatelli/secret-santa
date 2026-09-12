import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isParticipantName } from "@/lib/participants";

export async function POST(request: NextRequest) {
  const store = await cookies();
  if (!verifyAdminToken(store.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name;
  if (!isParticipantName(name)) {
    return NextResponse.json({ error: "Unknown participant." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("participants")
    .update({
      pin_hash: null,
      failed_attempts: 0,
      total_failed_attempts: 0,
      locked_until: null,
      permanently_locked: false,
    })
    .eq("name", name);

  if (error) {
    return NextResponse.json({ error: "Could not reset that PIN." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
