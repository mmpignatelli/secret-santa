import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyPinHash } from "@/lib/pin";
import { isParticipantName } from "@/lib/participants";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_COOKIE_MAX_AGE_SECONDS } from "@/lib/session";
import type { ParticipantRow } from "@/lib/types";

const LOCK_MS = 60 * 1000;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = body?.name;
  const pin = typeof body?.pin === "string" ? body.pin : "";

  if (!isParticipantName(name)) {
    return NextResponse.json({ error: "Unknown participant." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: participant, error } = await supabase
    .from("participants")
    .select("*")
    .eq("name", name)
    .maybeSingle<ParticipantRow>();

  if (error || !participant) {
    return NextResponse.json({ error: "Participant not found." }, { status: 404 });
  }

  if (!participant.pin_hash) {
    return NextResponse.json(
      { error: "No secret word has been set yet for this person." },
      { status: 400 }
    );
  }

  if (participant.permanently_locked) {
    return NextResponse.json(
      { error: "Too many wrong attempts. Please ask the sorting master for a reset." },
      { status: 423 }
    );
  }

  if (participant.locked_until && new Date(participant.locked_until).getTime() > Date.now()) {
    const secondsLeft = Math.ceil(
      (new Date(participant.locked_until).getTime() - Date.now()) / 1000
    );
    return NextResponse.json(
      { error: `Too many wrong attempts in a row. Try again in ${secondsLeft}s.` },
      { status: 423 }
    );
  }

  const valid = await verifyPinHash(pin, participant.pin_hash);

  if (!valid) {
    const totalFailed = participant.total_failed_attempts + 1;
    const consecutiveFailed = participant.failed_attempts + 1;
    const updates: Record<string, unknown> = { total_failed_attempts: totalFailed };

    if (totalFailed >= 5) {
      updates.permanently_locked = true;
      updates.failed_attempts = consecutiveFailed;
    } else if (consecutiveFailed >= 3) {
      updates.failed_attempts = 0;
      updates.locked_until = new Date(Date.now() + LOCK_MS).toISOString();
    } else {
      updates.failed_attempts = consecutiveFailed;
    }

    await supabase.from("participants").update(updates).eq("name", name);

    if (updates.permanently_locked) {
      return NextResponse.json(
        { error: "Too many wrong attempts. Please ask the sorting master for a reset." },
        { status: 423 }
      );
    }
    if (updates.locked_until) {
      return NextResponse.json(
        { error: "Too many wrong attempts in a row. Locked for 1 minute — try again shortly." },
        { status: 423 }
      );
    }
    return NextResponse.json({ error: "That secret word doesn't match." }, { status: 401 });
  }

  await supabase.from("participants").update({ failed_attempts: 0 }).eq("name", name);

  const token = createSessionToken(name);
  const response = NextResponse.json({ ok: true, name });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
