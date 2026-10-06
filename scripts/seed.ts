import "dotenv/config";
import { sampleData, modules } from "../src/lib/content";
import { list, save } from "../src/lib/store";
for (const m of [
  ...(["productCategories", "projectCategories", "sectors"] as const),
  ...modules.filter(
    (m) => !["productCategories", "projectCategories", "sectors"].includes(m),
  ),
]) {
  if (m === "users") continue;
  if ((await list(m)).length) continue;
  for (const entry of sampleData()[m]) await save(m, entry);
}
console.log("Sample content seeded without replacing existing content.");
process.exit(0);
