import crypto from "crypto";

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 8; // 8 hours

function getSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function encode(data: Record<string, unknown>, secret: string): string {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const sig = sign(payload, secret);
  return `${payload}.${sig}`;
}

function decode(token: string | undefined, secret: string): Record<string, unknown> | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload, secret);
  if (!safeEqual(sig, expected)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    return null;
  }
}

export function createSessionToken(name: string): string {
  return encode({ name, iat: Date.now() }, getSecret("SESSION_SECRET"));
}

export function verifySessionToken(token: string | undefined): { name: string } | null {
  const data = decode(token, getSecret("SESSION_SECRET"));
  if (!data || typeof data.name !== "string" || typeof data.iat !== "number") return null;
  if (Date.now() - data.iat > SESSION_COOKIE_MAX_AGE * 1000) return null;
  return { name: data.name };
}

export function createAdminToken(): string {
  return encode({ admin: true, iat: Date.now() }, getSecret("ADMIN_SESSION_SECRET"));
}

export function verifyAdminToken(token: string | undefined): boolean {
  const data = decode(token, getSecret("ADMIN_SESSION_SECRET"));
  if (!data || data.admin !== true || typeof data.iat !== "number") return false;
  if (Date.now() - data.iat > ADMIN_COOKIE_MAX_AGE * 1000) return false;
  return true;
}

export const SESSION_COOKIE_NAME = "ss_session";
export const ADMIN_COOKIE_NAME = "ss_admin";
export const SESSION_COOKIE_MAX_AGE_SECONDS = SESSION_COOKIE_MAX_AGE;
export const ADMIN_COOKIE_MAX_AGE_SECONDS = ADMIN_COOKIE_MAX_AGE;
