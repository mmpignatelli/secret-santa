export const PARTICIPANTS = [
  "Teresa",
  "Jaime",
  "Maria",
  "Miguel",
  "Rita",
  "Nuno",
  "Inês",
  "Joana",
  "Alice",
] as const;

export type ParticipantName = (typeof PARTICIPANTS)[number];

export function isParticipantName(value: unknown): value is ParticipantName {
  return typeof value === "string" && (PARTICIPANTS as readonly string[]).includes(value);
}

// Exclusion lists are self-inclusive: everyone is also excluded from drawing themselves.
export const EXCLUSIONS: Record<ParticipantName, ParticipantName[]> = {
  Teresa: ["Teresa", "Jaime", "Maria"],
  Jaime: ["Jaime", "Teresa", "Maria"],
  Maria: ["Maria", "Jaime", "Teresa"],
  Miguel: ["Miguel", "Alice"],
  Rita: ["Rita", "Nuno"],
  Nuno: ["Nuno", "Rita"],
  Inês: ["Inês", "Nuno", "Miguel", "Alice", "Rita", "Joana"],
  Joana: ["Joana", "Miguel", "Alice"],
  Alice: ["Alice", "Miguel"],
};

export function isExcluded(giver: ParticipantName, receiver: ParticipantName): boolean {
  return EXCLUSIONS[giver].includes(receiver);
}
