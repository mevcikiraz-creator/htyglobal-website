import "dotenv/config";
import { randomBytes, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import { save, dataDir } from "../src/lib/store";
const password = randomBytes(32).toString("base64url");
const email = "test-" + randomUUID() + "@example.invalid";
const id = randomUUID();
await save("users", {
  id,
  email,
  name: "Automated test administrator",
  role: "ADMIN",
  active: true,
  tokenVersion: 0,
  passwordHash: await hash(password, 12),
});
await mkdir(dataDir, { recursive: true });
await writeFile(
  dataDir + "/test-account.json",
  JSON.stringify({ email, password, id }),
  { mode: 0o600 },
);
console.log("Temporary test account prepared.");
process.exit(0);
