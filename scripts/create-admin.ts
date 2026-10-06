import "dotenv/config";
import { hash } from "bcryptjs";
import { randomUUID } from "node:crypto";
import { list, save } from "../src/lib/store";
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase(),
  password = process.env.ADMIN_PASSWORD;
if (
  !email ||
  !password ||
  password.length < 12 ||
  Buffer.byteLength(password) > 72
)
  throw new Error(
    "Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) securely in your shell",
  );
if ((await list("users")).some((u) => u.email === email))
  throw new Error("Account already exists");
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
