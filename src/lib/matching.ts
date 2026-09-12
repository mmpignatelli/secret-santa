/**
 * Finds a valid Secret Santa assignment via randomized exhaustive backtracking.
 * Guaranteed to find a valid full assignment if one exists (never relies on
 * generating random shuffles and rejecting invalid ones).
 */
export function computeAssignment<T extends string>(
  names: readonly T[],
  isExcluded: (giver: T, receiver: T) => boolean
): Record<T, T> | null {
  const givers = shuffle([...names]);
  const usedReceivers = new Set<T>();
  const assignment = {} as Record<T, T>;

  function backtrack(index: number): boolean {
    if (index === givers.length) return true;
    const giver = givers[index];
    const candidates = shuffle(
      names.filter((receiver) => !usedReceivers.has(receiver) && !isExcluded(giver, receiver))
    );
    for (const receiver of candidates) {
      assignment[giver] = receiver;
      usedReceivers.add(receiver);
      if (backtrack(index + 1)) return true;
      usedReceivers.delete(receiver);
    }
    delete assignment[giver];
    return false;
  }

  return backtrack(0) ? assignment : null;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
