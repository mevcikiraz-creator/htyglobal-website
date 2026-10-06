import "server-only";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { type Module, type RecordItem, sampleData } from "./content";
const globalDb = globalThis as unknown as {
  prisma?: PrismaClient;
  queue?: Promise<unknown>;
};
const delegates = {
  products: "product",
  productCategories: "productCategory",
  projects: "project",
  projectCategories: "projectCategory",
  sectors: "sector",
  pages: "page",
  clients: "client",
  blog: "blogPost",
  settings: "siteSetting",
  contacts: "contactSubmission",
  quotes: "quoteRequest",
  media: "media",
  users: "user",
};
export const dataDir = path.resolve(process.env.DATA_DIR || ".data");
function pg() {
  if (
    !process.env.DATABASE_URL &&
    process.env.NODE_ENV === "production" &&
    process.env.ALLOW_DEV_STORE !== "true"
  )
    throw new Error("DATABASE_URL is required in production");
  return Boolean(process.env.DATABASE_URL);
}
// Prisma delegates share the CRUD contract; model-specific fields are validated in actions.
type Delegate = {
  findMany: (args?: object) => Promise<RecordItem[]>;
  findFirst: (args: object) => Promise<RecordItem | null>;
  upsert: (args: object) => Promise<RecordItem>;
  delete: (args: object) => Promise<RecordItem>;
};
function table(m: Module): Delegate {
  globalDb.prisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  return (globalDb.prisma as unknown as Record<string, Delegate>)[delegates[m]];
}
async function load() {
  await mkdir(dataDir, { recursive: true });
  try {
    return JSON.parse(
      await readFile(path.join(dataDir, "content.json"), "utf8"),
    ) as Record<Module, RecordItem[]>;
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== "ENOENT") throw e;
    return sampleData();
  }
}
async function mutate<T>(
  fn: (db: Record<Module, RecordItem[]>) => T,
): Promise<T> {
  const job = (globalDb.queue || Promise.resolve()).then(async () => {
    const db = await load();
    const result = fn(db);
    const tmp = path.join(dataDir, randomUUID() + ".tmp");
    await writeFile(tmp, JSON.stringify(db, null, 2), { mode: 0o600 });
    await rename(tmp, path.join(dataDir, "content.json"));
    return result;
  });
  globalDb.queue = job.catch(() => {});
  return job;
}
function normalize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
export async function list(m: Module) {
  return pg() ? normalize(await table(m).findMany()) : (await load())[m] || [];
}
export async function get(m: Module, id: string) {
  if (pg()) {
    const hasSlug = !["users", "media", "contacts", "quotes"].includes(m);
    const entry = await table(m).findFirst({
      where: hasSlug ? { OR: [{ id }, { slug: id }] } : { id },
    });
    return entry ? normalize(entry) : undefined;
  }
  return (await list(m)).find((x) => x.id === id || x.slug === id);
}
export async function save(m: Module, input: RecordItem) {
  const now = new Date().toISOString();
  const entry = { ...input, id: input.id || randomUUID(), updatedAt: now };
  if (pg()) {
    const clean: RecordItem = { ...entry };
    delete clean.createdAt;
    delete clean.updatedAt;
    return table(m).upsert({
      where: { id: entry.id },
      create: clean,
      update: clean,
    });
  }
  return mutate((db) => {
    const index = db[m].findIndex((x) => x.id === entry.id);
    if (index < 0) {
      db[m].push({ ...entry, createdAt: now });
    } else db[m][index] = { ...db[m][index], ...entry };
    return entry;
  });
}
export async function remove(m: Module, id: string) {
  if (pg()) await table(m).delete({ where: { id } });
  else
    await mutate((db) => {
      db[m] = db[m].filter((x) => x.id !== id);
      if (m === "productCategories")
        for (const product of db.products)
          if (product.categoryId === id) product.categoryId = null;
      if (m === "projectCategories")
        for (const project of db.projects)
          if (project.categoryId === id) project.categoryId = null;
      if (m === "sectors")
        for (const item of [...db.products, ...db.projects])
          if (item.sectorId === id) item.sectorId = null;
    });
}
export async function published(
  m: Module,
  locale = "en",
): Promise<RecordItem[]> {
  const rows = pg()
    ? normalize(
        await table(m).findMany({
          where: { status: "PUBLISHED" },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        }),
      )
    : await list(m);
  return rows
    .filter((x) => x.status === "PUBLISHED")
    .sort(
      (a, b) =>
        (a.sortOrder || 0) - (b.sortOrder || 0) || a.id.localeCompare(b.id),
    )
    .map((x) => ({
      ...x,
      ...x.translations?.[locale],
      data: { ...x.data, ...x.translations?.[locale]?.data },
    }));
}
