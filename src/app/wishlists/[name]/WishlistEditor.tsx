"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WishlistEditor({ name, isOwner }: { name: string; isOwner: boolean }) {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "That didn't work.");
        return;
      }
      router.refresh();
    } catch {
      setError("The elves dropped this one. Please try again.");
      setLoading(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!description.trim()) {
      setError("Please add a short description.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, link, imageUrl }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        setError(data.error ?? "Could not save that item.");
        return;
      }
      setDescription("");
      setLink("");
      setImageUrl("");
      router.refresh();
    } catch {
      setError("The elves dropped this one. Please try again.");
      setLoading(false);
    }
  }

  if (!isOwner) {
    return (
      <details className="mt-8 rounded-xl border border-dashed border-red-200 bg-red-50/40 p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--santa-red)]">
          Is this your list? Add to it here.
        </summary>
        <form onSubmit={handleIdentify} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={`${name}'s secret word`}
            className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--santa-red)] focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-[var(--santa-red)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Checking…" : "That's me"}
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      </details>
    );
  }

  return (
    <form
      onSubmit={handleAddItem}
      className="mt-8 rounded-xl border border-red-100 bg-white p-4 shadow-sm"
    >
      <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--santa-red)]">
        Add something to your list
      </h3>
      <label className="mt-3 block text-sm font-medium">What is it?</label>
      <input
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Warm slippers, size 38"
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--santa-red)] focus:outline-none"
      />
      <label className="mt-3 block text-sm font-medium">Link (optional)</label>
      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="https://..."
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--santa-red)] focus:outline-none"
      />
      <label className="mt-3 block text-sm font-medium">Photo link (optional)</label>
      <input
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://... (a link to an image)"
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-[var(--santa-red)] focus:outline-none"
      />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-full bg-[var(--santa-red)] px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
      >
        {loading ? "Adding…" : "Add to my list"}
      </button>
    </form>
  );
}
