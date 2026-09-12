"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ label = "Log out" }: { label?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-sm text-neutral-500 underline decoration-dotted hover:text-[var(--santa-red)]"
    >
      {loading ? "…" : label}
    </button>
  );
}
