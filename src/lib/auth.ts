import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { dataDir, get } from "./store";
async function key() {
  if (process.env.AUTH_SECRET) {
    if (process.env.AUTH_SECRET.length < 32)
      throw new Error("AUTH_SECRET must contain at least 32 characters");
    return new TextEncoder().encode(process.env.AUTH_SECRET);
  }
  if (process.env.NODE_ENV === "production")
    throw new Error("AUTH_SECRET is required");
  await mkdir(dataDir, { recursive: true });
  const file = path.join(dataDir, "auth-key");
  try {
    return await readFile(file);
  } catch {
    const k = randomBytes(32);
    try {
      await writeFile(file, k, { flag: "wx", mode: 0o600 });
      return k;
    } catch {
      return await readFile(file);
    }
  }
}
export async function session() {
  try {
    const token = (await cookies()).get("hty-session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, await key(), {
      issuer: "hty-global",
      audience: "hty-admin",
    });
    const user = await get("users", String(payload.sub));
    if (!user || !user.active || user.tokenVersion !== payload.version)
      return null;
    return user;
  } catch {
    return null;
  }
}
export async function requireAdmin(owner = false) {
  const user = await session();
  if (!user || (owner && user.role !== "ADMIN"))
    throw new Error("Unauthorized");
  return user;
}
export async function createSession(user: {
  id: string;
  tokenVersion: unknown;
}) {
  const token = await new SignJWT({ version: user.tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer("hty-global")
    .setAudience("hty-admin")
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(await key());
  (await cookies()).set("hty-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 28800,
  });
}
