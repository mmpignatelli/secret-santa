import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isParticipantName } from "@/lib/participants";
import type { ParticipantRow } from "@/lib/types";

export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!isParticipantName(name)) {
    return NextResponse.json({ error: "Unknown participant." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("participants")
    .select("pin_hash, permanently_locked, locked_until")
    .eq("name", name)
    .maybeSingle<Pick<ParticipantRow, "pin_hash" | "permanently_locked" | "locked_until">>();

  if (error) {
    return NextResponse.json({ error: "Could not look up participant." }, { status: 500 });
  }

  return NextResponse.json({
    hasPin: !!data?.pin_hash,
    permanentlyLocked: !!data?.permanently_locked,
    lockedUntil: data?.locked_until ?? null,
  });
}
