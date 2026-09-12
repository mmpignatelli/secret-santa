import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PARTICIPANTS } from "@/lib/participants";
import ResetPinButton from "./ResetPinButton";
import RerunDrawButton from "./RerunDrawButton";
import AdminLogoutButton from "./AdminLogoutButton";
import type { DrawStateRow, MatchRow, ParticipantRow, WishlistItemRow } from "@/lib/types";

export const metadata: Metadata = {
  title: "Sorting Master Dashboard",
};

export default async function AdminPage() {
  const store = await cookies();
  if (!verifyAdminToken(store.get(ADMIN_COOKIE_NAME)?.value)) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseAdmin();
  const [{ data: participants }, { data: matches }, { data: drawState }, { data: wishlistItems }] =
    await Promise.all([
      supabase.from("participants").select("*").returns<ParticipantRow[]>(),
      supabase.from("matches").select("*").returns<MatchRow[]>(),
      supabase
        .from("draw_state")
        .select("*")
        .eq("id", 1)
        .maybeSingle<DrawStateRow>(),
      supabase.from("wishlist_items").select("owner_name").returns<Pick<WishlistItemRow, "owner_name">[]>(),
    ]);

  const byName = new Map((participants ?? []).map((p) => [p.name, p]));
  const wishlistCounts: Record<string, number> = {};
  for (const item of wishlistItems ?? []) {
    wishlistCounts[item.owner_name] = (wishlistCounts[item.owner_name] ?? 0) + 1;
  }
  // eslint-disable-next-line react-hooks/purity -- server component, re-fetched fresh per request
  const now = Date.now();

  return (
    <main className="flex-1 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl">🎩</p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--santa-red)]">
              Sorting Master Dashboard
            </h1>
          </div>
          <AdminLogoutButton />
        </div>

        <section className="mt-8 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--santa-red)]">
            The draw
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Status:{" "}
            <strong>{drawState?.completed ? "Completed and locked" : "Not run yet"}</strong>
            {drawState?.completed_at && (
              <> — {new Date(drawState.completed_at).toLocaleString()}</>
            )}
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Re-running erases the current matches and draws a brand new valid assignment for
            everyone. Only do this if something went wrong.
          </p>
          <div className="mt-3">
            <RerunDrawButton />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--santa-red)]">
            Participants
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="text-neutral-500">
                  <th className="pb-2 pr-2">Name</th>
                  <th className="pb-2 pr-2">PIN set</th>
                  <th className="pb-2 pr-2">Failed (streak / total)</th>
                  <th className="pb-2 pr-2">Locked</th>
                  <th className="pb-2 pr-2">Wishlist</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {PARTICIPANTS.map((name) => {
                  const p = byName.get(name);
                  const lockedUntilFuture =
                    p?.locked_until && new Date(p.locked_until).getTime() > now;
                  return (
                    <tr key={name} className="border-t border-red-50">
                      <td className="py-2 pr-2 font-medium">{name}</td>
                      <td className="py-2 pr-2">{p?.pin_hash ? "✅" : "—"}</td>
                      <td className="py-2 pr-2">
                        {p?.failed_attempts ?? 0} / {p?.total_failed_attempts ?? 0}
                      </td>
                      <td className="py-2 pr-2">
                        {p?.permanently_locked
                          ? "🔒 permanently"
                          : lockedUntilFuture
                            ? "⏳ 1 min"
                            : "—"}
                      </td>
                      <td className="py-2 pr-2">{wishlistCounts[name] ?? 0}</td>
                      <td className="py-2">
                        {p?.pin_hash ? <ResetPinButton name={name} /> : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--santa-red)]">
            Matches (troubleshooting only)
          </h2>
          {!matches || matches.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-500">No matches yet.</p>
          ) : (
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="text-neutral-500">
                  <th className="pb-2">Giver</th>
                  <th className="pb-2">Receiver</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((m) => (
                  <tr key={m.id} className="border-t border-red-50">
                    <td className="py-2">{m.giver_name}</td>
                    <td className="py-2">{m.receiver_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}
