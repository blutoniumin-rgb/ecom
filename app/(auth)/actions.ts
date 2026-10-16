"use server";

import {
  comparePassword,
  createResetToken,
  hashPassword,
  hashResetToken,
  safeNextPath,
  setSessionCookie,
  type Session,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type AuthState = {
  error?: string;
  resetUrl?: string;
} | null;

function sessionFromUser(user: {
  id: string;
  role: string;
  email: string;
  name: string;
}): Session {
  return {
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

function destinationFor(session: Session, next: string) {
  if (next === "/admin" || next.startsWith("/admin/")) {
    return session.role === "admin" ? next : "/";
  }
  return next;
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  const session = sessionFromUser(user);
  await setSessionCookie(session);
  redirect(destinationFor(session, next));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(formData.get("next"));

  if (!name || !email || !password) {
    return { error: "Name, email, and password are required." };
  }
  if (!email.includes("@")) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8) {
    return { error: "Use at least 8 characters for the password." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await hashPassword(password),
      role: "customer",
    },
  });

  const session = sessionFromUser(user);
  await setSessionCookie(session);
  redirect(destinationFor(session, next));
}

export async function forgotPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return { error: "Enter the email on the account." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "No account was found for that email." };
  }

  const token = createResetToken();
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: await hashResetToken(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  return { resetUrl: `/reset-password?token=${encodeURIComponent(token)}` };
}

export async function resetPasswordAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!token) return { error: "This reset link is missing a token." };
  if (password.length < 8) {
    return { error: "Use at least 8 characters for the password." };
  }

  const row = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash: await hashResetToken(token),
      expiresAt: { gt: new Date() },
    },
  });
  if (!row) {
    return { error: "This reset link is invalid or has expired." };
  }

  await prisma.user.update({
    where: { id: row.userId },
    data: { passwordHash: await hashPassword(password) },
  });
  await prisma.passwordResetToken.delete({ where: { id: row.id } });
  redirect("/login?reset=1");
}
