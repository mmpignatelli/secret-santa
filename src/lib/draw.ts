import { getSupabaseAdmin } from "./supabaseAdmin";
import { PARTICIPANTS, isExcluded, type ParticipantName } from "./participants";
import { computeAssignment } from "./matching";
import type { ParticipantRow } from "./types";

async function buildAssignmentRows() {
  const assignment = computeAssignment<ParticipantName>(PARTICIPANTS, isExcluded);
  if (!assignment) {
    throw new Error("No valid assignment could be found under the exclusion rules.");
  }
  return Object.entries(assignment).map(([giver_name, receiver_name]) => ({
    giver_name,
    receiver_name,
  }));
}

/**
 * Called after every successful PIN-set. Runs the draw exactly once, the
 * moment all nine participants have a PIN. Uses an atomic conditional update
 * on draw_state as a claim/lock so concurrent requests can't double-run it.
 */
export async function maybeRunDraw(): Promise<{ ran: boolean }> {
  const supabase = getSupabaseAdmin();

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("name, pin_hash");
  if (participantsError) throw participantsError;

  const rows = (participants ?? []) as Pick<ParticipantRow, "name" | "pin_hash">[];
  const allSet = PARTICIPANTS.every((name) =>
    rows.some((row) => row.name === name && !!row.pin_hash)
  );
  if (!allSet) return { ran: false };

  const { data: claimed, error: claimError } = await supabase
    .from("draw_state")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", 1)
    .eq("completed", false)
    .select();
  if (claimError) throw claimError;
  if (!claimed || claimed.length === 0) return { ran: false };

  try {
    const rows = await buildAssignmentRows();
    const { error: insertError } = await supabase.from("matches").insert(rows);
    if (insertError) throw insertError;
  } catch (err) {
    await supabase
      .from("draw_state")
      .update({ completed: false, completed_at: null })
      .eq("id", 1);
    throw err;
  }

  return { ran: true };
}

/** Admin-only manual rerun: wipes existing matches and draws again. */
export async function forceRerunDraw(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const rows = await buildAssignmentRows();

  const { error: deleteError } = await supabase
    .from("matches")
    .delete()
    .neq("giver_name", "__none__");
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from("matches").insert(rows);
  if (insertError) throw insertError;

  const { error: stateError } = await supabase
    .from("draw_state")
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq("id", 1);
  if (stateError) throw stateError;
}
