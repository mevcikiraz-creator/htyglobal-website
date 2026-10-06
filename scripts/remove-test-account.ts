import "dotenv/config";
import { readFile, unlink } from "node:fs/promises";
import { remove, dataDir } from "../src/lib/store";
const account = JSON.parse(
  await readFile(dataDir + "/test-account.json", "utf8"),
);
await remove("users", account.id);
await unlink(dataDir + "/test-account.json");
console.log("Temporary test account removed.");
process.exit(0);
