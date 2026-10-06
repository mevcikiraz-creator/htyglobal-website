import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
test("development store persists concurrent mutations and keeps drafts private", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "hty-store-"));
  process.env.DATA_DIR = directory;
  process.env.DATABASE_URL = "";
  Object.defineProperty(process.env, "NODE_ENV", {
    value: "development",
    writable: true,
    enumerable: true,
    configurable: true,
  });
  const { save, get, remove, published } = await import("../src/lib/store");
  try {
    await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        save("products", {
          id: "test-" + i,
          title: "Test " + i,
          slug: "test-" + i,
          status: i === 0 ? "PUBLISHED" : "DRAFT",
          sortOrder: i,
          data: {},
          translations: {},
        }),
      ),
    );
    const stored = JSON.parse(
      await readFile(path.join(directory, "content.json"), "utf8"),
    );
    assert.equal(
      stored.products.filter((x: { id: string }) => x.id.startsWith("test-"))
        .length,
      10,
    );
    assert.equal(
      (await published("products")).filter((x) => x.id.startsWith("test-"))
        .length,
      1,
    );
    assert.equal((await get("products", "test-9"))?.title, "Test 9");
    await remove("products", "test-9");
    assert.equal(await get("products", "test-9"), undefined);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
