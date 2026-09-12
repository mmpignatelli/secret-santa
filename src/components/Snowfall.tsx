const FLAKES = Array.from({ length: 24 }, (_, i) => {
  // Deterministic pseudo-randomness so server and client markup match.
  const seed = i * 37;
  const left = (seed % 100) + (i % 3) * 0.7;
  const duration = 8 + (seed % 9);
  const delay = -(seed % 12);
  const size = 10 + (i % 4) * 4;
  const drift = ((i % 5) - 2) * 20;
  const opacity = 0.5 + (i % 5) * 0.1;
  return { id: i, left, duration, delay, size, drift, opacity };
});

export default function Snowfall() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {FLAKES.map((flake) => (
        <span
          key={flake.id}
          className="snowflake select-none"
          style={{
            left: `${flake.left}%`,
            fontSize: `${flake.size}px`,
            opacity: flake.opacity,
            animationDuration: `${flake.duration}s`,
            animationDelay: `${flake.delay}s`,
            ["--drift" as string]: `${flake.drift}px`,
          }}
        >
          ❄
        </span>
      ))}
    </div>
  );
}
