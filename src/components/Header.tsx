import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-[var(--santa-red)] text-white shadow-md">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl sm:text-2xl">
          <span aria-hidden="true">🎅</span>
          <span>Marques Family Secret Santa</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm sm:text-base">
          <Link href="/my-match" className="rounded-full px-3 py-1.5 hover:bg-white/15 transition-colors">
            My match
          </Link>
          <Link href="/wishlists" className="rounded-full px-3 py-1.5 hover:bg-white/15 transition-colors">
            Wishlists
          </Link>
        </nav>
      </div>
    </header>
  );
}
