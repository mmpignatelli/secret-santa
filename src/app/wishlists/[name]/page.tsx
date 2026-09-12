import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { isParticipantName } from "@/lib/participants";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";
import DeleteWishlistItemButton from "@/components/DeleteWishlistItemButton";
import WishlistEditor from "./WishlistEditor";
import type { WishlistItemRow } from "@/lib/types";

type Params = { name: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { name } = await params;
  return { title: `${decodeURIComponent(name)}'s Christmas Wishlist` };
}

export default async function WishlistPage({ params }: { params: Promise<Params> }) {
  const { name: rawName } = await params;
  const name = decodeURIComponent(rawName);

  if (!isParticipantName(name)) {
    notFound();
  }

  const store = await cookies();
  const session = verifySessionToken(store.get(SESSION_COOKIE_NAME)?.value);
  const isOwner = session?.name === name;

  const supabase = getSupabaseAdmin();
  const { data: items } = await supabase
    .from("wishlist_items")
    .select("id, description, link, image_url, created_at")
    .eq("owner_name", name)
    .order("created_at", { ascending: true })
    .returns<WishlistItemRow[]>();

  return (
    <main className="flex-1 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Link href="/wishlists" className="text-sm text-neutral-500 hover:text-[var(--santa-red)]">
          ← All wishlists
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--santa-red)]">
          {name}&apos;s Christmas Wishlist
        </h1>

        {!items || items.length === 0 ? (
          <p className="mt-6 rounded-xl border border-dashed border-red-200 bg-red-50/40 p-6 text-center text-neutral-600">
            🧝 Nothing on the list yet — the elves are waiting for ideas.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-red-100 bg-white p-4 shadow-sm"
              >
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="break-words">{item.description}</p>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="mt-1 inline-block text-sm text-[var(--santa-red)] underline"
                    >
                      View item ↗
                    </a>
                  )}
                </div>
                {isOwner && <DeleteWishlistItemButton id={item.id} />}
              </li>
            ))}
          </ul>
        )}

        <WishlistEditor name={name} isOwner={isOwner} />
      </div>
    </main>
  );
}
