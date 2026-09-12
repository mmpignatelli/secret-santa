import bcrypt from "bcryptjs";

export function normalizePin(pin: string): string {
  return pin.trim().toLowerCase();
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(normalizePin(pin), 10);
}

export async function verifyPinHash(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(normalizePin(pin), hash);
}
