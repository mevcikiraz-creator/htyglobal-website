import "dotenv/config";
import { hash, compare } from "bcryptjs";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { list, save } from "../src/lib/store";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  password = process.env.ADMIN_PASSWORD;
if (
  !email ||
  !z.email().safeParse(email).success ||
  !password ||
  password.length < 12 ||
  Buffer.byteLength(password) > 72
)
  throw new Error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) securely in your shell",
  );
const users = await list("users");
const existing = users.find((u) => u.email === email);
if (process.argv.includes("--bootstrap")) {
  if (existing) {
    if (
      existing.role !== "ADMIN" ||
      existing.active !== true ||
      !(await compare(password, String(existing.passwordHash)))
    )
      throw new Error(
        "Existing account will not be overwritten. Disable bootstrap and use the existing administrator.",
      );
    console.log("Administrator already initialized; account unchanged.");
    process.exit(0);
  }
  if (users.some((u) => u.role === "ADMIN" && u.active))
    throw new Error(
      "An active administrator already exists. Use the admin panel to create additional users.",
    );
} else if (existing) {
  throw new Error("Account already exists");
}
await save("users", {
  id: randomUUID(),
  email,
  name: "Administrator",
  passwordHash: await hash(password, 12),
  role: "ADMIN",
  active: true,
  tokenVersion: 0,
});
console.log("Administrator created.");
process.exit(0);
