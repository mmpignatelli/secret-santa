"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RerunDrawButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        "This will erase the current matches and draw new ones for everyone. Are you sure?"
      )
    )
      return;
    setLoading(true);
    const res = await fetch("/api/admin/rerun-draw", { method: "POST" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "The draw failed to run.");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full bg-[var(--santa-red)] px-4 py-2 text-sm font-semibold text-white hover:scale-105 transition-transform disabled:opacity-60"
    >
      {loading ? "Drawing…" : "Force re-run the draw"}
    </button>
  );
}
