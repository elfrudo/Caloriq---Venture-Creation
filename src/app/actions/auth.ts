"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validation";

export type FormState = { error?: string } | undefined;

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) return { error: "An account with this email already exists." };
  const user = await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 10) } });
  await createSession(user.id);
  redirect("/onboarding");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const user = await db.user.findUnique({ where: { email: parsed.data.email }, include: { profile: true } });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return { error: "Incorrect email or password." };
  await createSession(user.id);
  redirect(user.profile ? "/dashboard" : "/onboarding");
}

export async function logout() {
  destroySession();
  redirect("/login");
}
