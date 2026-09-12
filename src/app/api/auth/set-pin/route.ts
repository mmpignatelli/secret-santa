import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPin } from "@/lib/pin";
import { isParticipantName } from "@/lib/participants";
import { maybeRunDraw } from "@/lib/draw";
import type { ParticipantRow } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name;
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!isParticipantName(name)) {
    return NextResponse.json({ error: "Unknown participant." }, { status: 400 });
  }

  const cleanPin = pin.trim();
  if (cleanPin.length < 4) {
    return NextResponse.json(
      { error: "Your secret word should be at least 4 characters." },
      { status: 400 }
    );
  }
  if (/^\d+$/.test(cleanPin)) {
    return NextResponse.json(
      { error: "Please choose a word rather than only digits." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: existing, error: fetchError } = await supabase
    .from("participants")
    .select("pin_hash")
    .eq("name", name)
    .maybeSingle<Pick<ParticipantRow, "pin_hash">>();

  if (fetchError) {
    return NextResponse.json({ error: "Could not look up participant." }, { status: 500 });
  }
  if (existing?.pin_hash) {
    return NextResponse.json(
      {
        error:
          "This person already has a secret word set. Ask the sorting master for a reset if it's forgotten.",
      },
      { status: 409 }
    );
  }

  const pin_hash = await hashPin(cleanPin);
  const { error: updateError } = await supabase
    .from("participants")
    .update({
      pin_hash,
      failed_attempts: 0,
      total_failed_attempts: 0,
      locked_until: null,
      permanently_locked: false,
    })
    .eq("name", name);

  if (updateError) {
    return NextResponse.json({ error: "Could not save your secret word." }, { status: 500 });
  }

  try {
    await maybeRunDraw();
  } catch (err) {
    console.error("Draw failed to run automatically:", err);
  }

  return NextResponse.json({ ok: true });
}
