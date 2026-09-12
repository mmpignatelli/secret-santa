"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPinButton({ name }: { name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        `Reset ${name}'s secret word? They'll be able to set a brand new one next time they visit.`
      )
    )
      return;
    setLoading(true);
    const res = await fetch("/api/admin/reset-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not reset that PIN.");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-full border border-[var(--santa-red)] px-3 py-1 text-xs font-semibold text-[var(--santa-red)] hover:bg-red-50 disabled:opacity-60"
    >
      {loading ? "Resetting…" : "Reset PIN"}
    </button>
  );
}
