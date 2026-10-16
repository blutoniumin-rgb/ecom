export const SESSION_COOKIE = "wearism_session";

const DEV_AUTH_SECRET = "wearism-dev-auth-secret";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type Session = {
  userId: string;
  role: string;
  email: string;
  name: string;
};

type SessionPayload = Session & { exp: number };

const textEncoder = new TextEncoder();

function authSecret() {
  return process.env.AUTH_SECRET || DEV_AUTH_SECRET;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded =
    value.replaceAll("-", "+").replaceAll("_", "/") +
    "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function signaturesMatch(left: string, right: string) {
  const a = textEncoder.encode(left);
  const b = textEncoder.encode(right);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a[index]! ^ b[index]!;
  }
  return mismatch === 0;
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(authSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function signSessionToken(session: Session) {
  const payload = bytesToBase64Url(
    textEncoder.encode(
      JSON.stringify({
        userId: session.userId,
        role: session.role,
        email: session.email,
        name: session.name,
        exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      } satisfies SessionPayload),
    ),
  );
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!payload || !signature || signature.includes(".")) return null;
  const expected = await hmac(payload);
  if (!signaturesMatch(signature, expected)) return null;

  try {
    const parsed = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload)),
    ) as Partial<SessionPayload>;
    if (
      typeof parsed.userId !== "string" ||
      typeof parsed.role !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.name !== "string" ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Date.now()
    ) {
      return null;
    }
    return {
      userId: parsed.userId,
      role: parsed.role,
      email: parsed.email,
      name: parsed.name,
    };
  } catch {
    return null;
  }
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

async function cookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookieStore()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUser() {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return session;
}

export async function setSessionCookie(session: Session) {
  const token = await signSessionToken(session);
  (await cookieStore()).set(SESSION_COOKIE, token, sessionCookieOptions());
}

export async function clearSessionCookie() {
  (await cookieStore()).set(SESSION_COOKIE, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });
}

export async function hashPassword(password: string) {
  const bcrypt = (await import("bcryptjs")).default;
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, passwordHash: string) {
  const bcrypt = (await import("bcryptjs")).default;
  return bcrypt.compare(password, passwordHash);
}

export async function hashResetToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export function createResetToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export function safeNextPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "/";
  return value;
}
