import Link from "next/link";
import type { Metadata } from "next";
import { PARTICIPANTS } from "@/lib/participants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { WishlistItemRow } from "@/lib/types";

export const metadata: Metadata = {
  title: "Family Wishlists — Marques Family Secret Santa",
};

export const dynamic = "force-dynamic";

export default async function WishlistsIndexPage() {
  const supabase = getSupabaseAdmin();
  const { data: items } = await supabase
    .from("wishlist_items")
    .select("owner_name")
    .returns<Pick<WishlistItemRow, "owner_name">[]>();

  const counts: Record<string, number> = {};
  for (const item of items ?? []) {
    counts[item.owner_name] = (counts[item.owner_name] ?? 0) + 1;
  }

  return (
    <main className="flex-1 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-3xl">🎄</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--santa-red)]">
          Family Wishlists
        </h1>
        <p className="mt-2 text-neutral-600">
          Everyone&apos;s gift ideas, out in the open. No secret word needed to browse — only to
          edit your own.
        </p>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--pine-green)]/10 px-4 py-2 text-sm font-medium text-[var(--pine-green)]">
          🧝 Budget reminder from the elves: please keep gifts to <strong>€30 or under</strong>.
        </p>
      </div>
      <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-2">
        {PARTICIPANTS.map((name) => (
          <Link
            key={name}
            href={`/wishlists/${encodeURIComponent(name)}`}
            className="flex items-center justify-between rounded-xl border border-red-100 bg-white px-5 py-4 shadow-sm transition-colors hover:border-[var(--santa-red)] hover:bg-red-50"
          >
            <span className="font-medium">{name}&apos;s list</span>
            <span className="text-sm text-neutral-500">
              {counts[name] ? `${counts[name]} item${counts[name] === 1 ? "" : "s"}` : "empty"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
