import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const key = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
const MAX_AGE = 60 * 60 * 24 * 7;

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(key());
  cookies().set("session", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE });
}
export function destroySession() { cookies().delete("session"); }

export async function getUser() {
  const token = cookies().get("session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return await db.user.findUnique({ where: { id: String(payload.userId) } });
  } catch { return null; }
}
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
