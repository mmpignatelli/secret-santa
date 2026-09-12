"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Wrong password.");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-sm"
    >
      <p className="text-3xl">🎩</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
        Sorting Master
      </h1>
      <p className="mt-1 text-sm text-neutral-600">This area is for admin use only.</p>
      <label className="mt-4 block text-sm font-medium">Admin password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-[var(--santa-red)] focus:outline-none"
      />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-full bg-[var(--santa-red)] px-4 py-2.5 font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
      >
        {loading ? "Checking…" : "Enter"}
      </button>
    </form>
  );
}
