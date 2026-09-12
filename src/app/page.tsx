import Link from "next/link";
import Snowfall from "@/components/Snowfall";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PARTICIPANTS } from "@/lib/participants";
import type { DrawStateRow, ParticipantRow } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = getSupabaseAdmin();
  const [{ data: drawState }, { data: participants }] = await Promise.all([
    supabase.from("draw_state").select("completed").eq("id", 1).maybeSingle<Pick<DrawStateRow, "completed">>(),
    supabase.from("participants").select("name, pin_hash"),
  ]);

  const completed = drawState?.completed ?? false;
  const joined = new Set(
    (participants as Pick<ParticipantRow, "name" | "pin_hash">[] | null ?? [])
      .filter((p) => p.pin_hash)
      .map((p) => p.name)
  );
  const joinedCount = joined.size;

  return (
    <main className="flex-1">
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--santa-red)] to-[var(--santa-red-dark)] px-4 py-16 text-center text-white sm:py-24">
        <Snowfall />
        <div className="relative mx-auto max-w-2xl">
          <p className="gentle-bounce text-5xl">🎅🤶🧝</p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl sm:text-6xl">
            Marques Family Secret Santa
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-balance text-red-50/90">
            Santa had the big idea. Mrs Claus is making sure it actually happens.
            The elves are handling absolutely everything in between.
          </p>

          {completed ? (
            <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
              <p className="text-2xl">🎁</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                The names have been drawn!
              </h2>
              <p className="mt-2 text-sm text-red-50/90">
                Mrs Claus has sealed the list — nobody sees any pairing except their own.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/login"
                  className="w-full rounded-full bg-white px-6 py-3 font-semibold text-[var(--santa-red)] shadow-sm transition-transform hover:scale-105 sm:w-auto"
                >
                  See who I&apos;m buying for
                </Link>
                <Link
                  href="/wishlists"
                  className="w-full rounded-full border border-white/60 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
                >
                  Browse wishlists
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/20">
              <p className="text-2xl">🧝‍♀️🧝‍♂️</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
                The elves are still gathering everyone
              </h2>
              <p className="mt-2 text-sm text-red-50/90">
                The drawing happens automatically the moment all nine people have joined and set
                their secret word.
              </p>
              <p className="mt-4 text-lg font-semibold">{joinedCount} of 9 have joined</p>
              <div className="mx-auto mt-4 grid max-w-sm grid-cols-3 gap-2 text-sm">
                {PARTICIPANTS.map((name) => (
                  <div
                    key={name}
                    className={`rounded-lg px-2 py-1.5 ${
                      joined.has(name) ? "bg-white/25" : "bg-black/10 text-red-50/70"
                    }`}
                  >
                    {joined.has(name) ? "✅ " : "⏳ "}
                    {name}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link
                  href="/login"
                  className="inline-block w-full rounded-full bg-white px-6 py-3 font-semibold text-[var(--santa-red)] shadow-sm transition-transform hover:scale-105 sm:w-auto"
                >
                  Join the drawing
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <Character emoji="🎅" name="Santa" role="Big ideas, zero details" />
          <Character emoji="🤶" name="Mrs Claus" role="Keeps it all running correctly" />
          <Character emoji="🧝" name="The elves" role="Cheerful, chaotic, get it done" />
        </div>
      </section>
    </main>
  );
}

function Character({ emoji, name, role }: { emoji: string; name: string; role: string }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white p-5 text-center shadow-sm">
      <p className="text-4xl">{emoji}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-[var(--santa-red)]">
        {name}
      </p>
      <p className="mt-1 text-sm text-neutral-600">{role}</p>
    </div>
  );
}
