"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PARTICIPANTS } from "@/lib/participants";

type Step = "pick-name" | "checking" | "set-pin" | "enter-pin" | "locked";

export default function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("pick-name");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handlePickName(selected: string) {
    setName(selected);
    setError(null);
    setStep("checking");
    try {
      const res = await fetch(`/api/participant-status?name=${encodeURIComponent(selected)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setStep("pick-name");
        return;
      }
      if (data.permanentlyLocked) {
        setStep("locked");
        return;
      }
      setStep(data.hasPin ? "enter-pin" : "set-pin");
    } catch {
      setError("The elves dropped this one. Please try again.");
      setStep("pick-name");
    }
  }

  async function handleSetPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (pin.trim().length < 4) {
      setError("Your secret word should be at least 4 characters.");
      return;
    }
    if (pin !== confirmPin) {
      setError("The two secret words don't match.");
      return;
    }
    setLoading(true);
    try {
      const setRes = await fetch("/api/auth/set-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pin }),
      });
      const setData = await setRes.json();
      if (!setRes.ok) {
        setError(setData.error ?? "Could not save your secret word.");
        setLoading(false);
        return;
      }
      await doLogin();
    } catch {
      setError("The elves dropped this one. Please try again.");
      setLoading(false);
    }
  }

  async function handleEnterPin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    await doLogin();
  }

  async function doLogin() {
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
        if (res.status === 423 && data.error?.toLowerCase().includes("reset")) {
          setStep("locked");
        }
        return;
      }
      router.push("/my-match");
      router.refresh();
    } catch {
      setError("The elves dropped this one. Please try again.");
      setLoading(false);
    }
  }

  function reset() {
    setStep("pick-name");
    setName("");
    setPin("");
    setConfirmPin("");
    setError(null);
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
      {step === "pick-name" || step === "checking" ? (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
            Who&apos;s there?
          </h2>
          <p className="mt-1 text-sm text-neutral-600">Pick your name to get started.</p>
          <div className="mt-4 grid grid-cols-1 gap-2">
            {PARTICIPANTS.map((p) => (
              <button
                key={p}
                onClick={() => handlePickName(p)}
                disabled={step === "checking"}
                className="rounded-lg border border-red-100 px-4 py-2 text-left transition-colors hover:border-[var(--santa-red)] hover:bg-red-50 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
          {step === "checking" && (
            <p className="mt-3 text-sm text-neutral-500">🧝 Checking the list…</p>
          )}
        </div>
      ) : step === "locked" ? (
        <div className="text-center">
          <p className="text-3xl">🔒</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
            Too many tries
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {name} has had too many wrong secret words. Please ask the sorting master to reset it.
          </p>
          <button onClick={reset} className="mt-4 text-sm text-[var(--santa-red)] underline">
            Back
          </button>
        </div>
      ) : step === "set-pin" ? (
        <form onSubmit={handleSetPin}>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
            Hi, {name}! 👋
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            First time here — choose a secret word (not just numbers) so you can check your match
            later. Nobody, not even the sorting master, can see it once it&apos;s set.
          </p>
          <label className="mt-4 block text-sm font-medium">Secret word</label>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-[var(--santa-red)] focus:outline-none"
            placeholder="e.g. gingerbread"
            autoFocus
          />
          <label className="mt-3 block text-sm font-medium">Confirm secret word</label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-[var(--santa-red)] focus:outline-none"
          />
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-[var(--santa-red)] px-4 py-2.5 font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? "Saving…" : "Set my secret word"}
          </button>
          <button type="button" onClick={reset} className="mt-3 w-full text-sm text-neutral-500">
            Not you? Go back
          </button>
        </form>
      ) : (
        <form onSubmit={handleEnterPin}>
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--santa-red)]">
            Welcome back, {name}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">Enter your secret word.</p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-4 w-full rounded-lg border border-neutral-300 px-3 py-2 focus:border-[var(--santa-red)] focus:outline-none"
            autoFocus
          />
          {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-5 w-full rounded-full bg-[var(--santa-red)] px-4 py-2.5 font-semibold text-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
          <button type="button" onClick={reset} className="mt-3 w-full text-sm text-neutral-500">
            Not you? Go back
          </button>
        </form>
      )}
    </div>
  );
}
