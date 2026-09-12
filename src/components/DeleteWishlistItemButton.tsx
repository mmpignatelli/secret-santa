"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteWishlistItemButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm("Remove this item from your wishlist?")) return;
    setLoading(true);
    const res = await fetch(`/api/wishlist?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not remove that item.");
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      aria-label="Remove item"
      className="shrink-0 rounded-full px-2 py-1 text-neutral-400 hover:bg-red-50 hover:text-[var(--santa-red)]"
    >
      {loading ? "…" : "✕"}
    </button>
  );
}
