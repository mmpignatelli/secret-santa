import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-red-100 bg-white/60 py-6 text-center text-xs text-[var(--santa-red-dark)]/70">
      <p>
        Made with 🎄 for the Marques family. Wrong reindeer? Ask the{" "}
        <Link href="/admin/login" className="underline decoration-dotted hover:text-[var(--santa-red)]">
          sorting master
        </Link>{" "}
        for help.
      </p>
    </footer>
  );
}
