import { cookies } from "next/headers";
import Link from "next/link";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import LogoutButton from "@/components/LogoutButton";
import type { DrawStateRow, MatchRow } from "@/lib/types";

export default async function MyMatchPage() {
  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
        <div>
          <p className="text-3xl">🧝</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
            Who are you again?
          </h1>
          <p className="mt-2 text-neutral-600">Please identify yourself first.</p>
          <Link
            href="/login"
            className="mt-4 inline-block rounded-full bg-[var(--santa-red)] px-6 py-2.5 font-semibold text-white hover:scale-105 transition-transform"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  const supabase = getSupabaseAdmin();
  const { data: drawState } = await supabase
    .from("draw_state")
    .select("completed")
    .eq("id", 1)
    .maybeSingle<Pick<DrawStateRow, "completed">>();

  if (!drawState?.completed) {
    return (
      <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
        <div>
          <p className="text-3xl">🤶</p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
            Hang tight, {session.name}
          </h1>
          <p className="mt-2 max-w-sm text-neutral-600">
            Mrs Claus is still waiting for everyone to join. The drawing runs automatically the
            moment all nine people have set their secret word.
          </p>
          <div className="mt-4">
            <LogoutButton label="Not you? Log out" />
          </div>
        </div>
      </main>
    );
  }

  const { data: match } = await supabase
    .from("matches")
    .select("receiver_name")
    .eq("giver_name", session.name)
    .maybeSingle<Pick<MatchRow, "receiver_name">>();

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-sm rounded-2xl border border-red-100 bg-white p-8 shadow-sm">
        <p className="gentle-bounce text-4xl">🎁</p>
        <p className="mt-3 text-sm uppercase tracking-wide text-neutral-500">
          Shh — for your eyes only, {session.name}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--santa-red)]">
          {match?.receiver_name ?? "Unknown"}
        </h1>
        <p className="mt-4 text-sm text-neutral-600">
          That&apos;s who you&apos;re buying a gift for this year. Keep it secret, keep it safe!
        </p>
        {match?.receiver_name && (
          <Link
            href={`/wishlists/${encodeURIComponent(match.receiver_name)}`}
            className="mt-6 inline-block w-full rounded-full bg-[var(--santa-red)] px-4 py-2.5 font-semibold text-white transition-transform hover:scale-105"
          >
            See their wishlist
          </Link>
        )}
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>
    </main>
  );
}
