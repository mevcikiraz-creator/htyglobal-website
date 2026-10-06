import "dotenv/config";
import { sampleData, modules } from "../src/lib/content";
import { get, save } from "../src/lib/store";
for (const m of modules)
  for (const entry of sampleData()[m]) {
    const current = await get(m, entry.id);
    if (current && entry.translations?.tr && !current.translations?.tr)
      await save(m, { ...current, translations: entry.translations });
  }
process.exit(0);
