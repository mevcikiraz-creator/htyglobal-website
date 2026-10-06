import { Pool } from "pg";
import { createHash } from "node:crypto";
const root = globalThis as unknown as {
  rates?: Map<string, { n: number; until: number }>;
  ratePool?: Pool;
};
export async function rateLimit(rawKey: string, max = 10) {
  const key = createHash("sha256").update(rawKey).digest("hex");
  if (process.env.DATABASE_URL) {
    root.ratePool ??= new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3,
    });
    const result = await root.ratePool.query<{ hits: number }>(
      `INSERT INTO "RateLimit" ("key","hits","expiresAt") VALUES ($1,1,NOW()+INTERVAL '10 minutes') ON CONFLICT ("key") DO UPDATE SET "hits"=CASE WHEN "RateLimit"."expiresAt"<NOW() THEN 1 ELSE "RateLimit"."hits"+1 END,"expiresAt"=CASE WHEN "RateLimit"."expiresAt"<NOW() THEN NOW()+INTERVAL '10 minutes' ELSE "RateLimit"."expiresAt" END RETURNING "hits"`,
      [key],
    );
    return result.rows[0].hits <= max;
  }
  root.rates ??= new Map();
  const now = Date.now();
  for (const [k, v] of root.rates) if (v.until < now) root.rates.delete(k);
  const entry = root.rates.get(key) || { n: 0, until: now + 600000 };
  entry.n++;
  root.rates.set(key, entry);
  return entry.n <= max;
}
