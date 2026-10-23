"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}

const getSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSnapshot = () => null;

// Dec 25 13:00 GMT (UTC in winter); rolls to next year once this year's has passed.
function targetSeconds(nowSeconds: number): number {
  const year = new Date(nowSeconds * 1000).getUTCFullYear();
  const thisYear = Date.UTC(year, 11, 25, 13, 0, 0) / 1000;
  return nowSeconds <= thisYear ? thisYear : Date.UTC(year + 1, 11, 25, 13, 0, 0) / 1000;
}

export default function ChristmasCountdown() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const remaining = now === null ? null : Math.max(0, targetSeconds(now) - now);
  const parts =
    remaining === null
      ? [
          ["Days", "--"],
          ["Hours", "--"],
          ["Minutes", "--"],
          ["Seconds", "--"],
        ]
      : [
          ["Days", Math.floor(remaining / 86400)],
          ["Hours", Math.floor((remaining % 86400) / 3600)],
          ["Minutes", Math.floor((remaining % 3600) / 60)],
          ["Seconds", remaining % 60],
        ];

  return (
    <div className="mt-8" aria-live="off">
      <p className="text-sm uppercase tracking-wide text-red-50/90">🎄 Countdown to Christmas</p>
      <div className="mx-auto mt-3 grid max-w-sm grid-cols-4 gap-2">
        {parts.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white/10 px-2 py-3 ring-1 ring-white/20">
            <p className="font-[family-name:var(--font-display)] text-3xl tabular-nums sm:text-4xl">
              {typeof value === "number" ? String(value).padStart(2, "0") : value}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-red-50/80">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-red-50/70">Until 25 December, 13:00 GMT</p>
    </div>
  );
}
