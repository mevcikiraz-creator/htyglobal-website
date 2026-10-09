import { test } from "node:test";
import assert from "node:assert/strict";
import { applyProjectRelease } from "../src/lib/project-release";
import type { Module, RecordItem } from "../src/lib/content";

function fixture() {
  const items: Record<string, RecordItem> = {
    "projectCategories:restaurant": { id: "restaurant-id" },
    "sectors:restaurant-cafe": { id: "restaurant-sector-id" },
  };
  const store = {
    get: async (module: Module, id: string) => items[`${module}:${id}`],
    save: async (module: Module, item: RecordItem) => {
      items[`${module}:${item.id}`] = item;
    },
  };
  return { items, store };
}

test("imports the supplied restaurant with resolved categories and localized location", async () => {
  const { items, store } = fixture();
  assert.equal(await applyProjectRelease(store), 1);
  const project = items["projects:fiorentini-bistro-moscow"];
  assert.equal(project.categoryId, "restaurant-id");
  assert.equal(project.sectorId, "restaurant-sector-id");
  assert.equal(project.status, "PUBLISHED");
  assert.equal(project.data?.country, "Russia");
  assert.equal(project.translations?.tr.data?.location, "Moskova");
  assert.equal((project.data?.gallery as string[]).length, 11);
  assert.equal(await applyProjectRelease(store), 0);
});

test("redeployments preserve CMS edits and do not recreate deleted projects", async () => {
  const { items, store } = fixture();
  await applyProjectRelease(store);
  const project = items["projects:fiorentini-bistro-moscow"];
  project.title = "Edited by the owner";
  project.status = "DRAFT";
  assert.equal(await applyProjectRelease(store), 0);
  assert.equal(project.title, "Edited by the owner");
  assert.equal(project.status, "DRAFT");
  delete items["projects:fiorentini-bistro-moscow"];
  assert.equal(await applyProjectRelease(store), 0);
  assert.equal(items["projects:fiorentini-bistro-moscow"], undefined);
});

test("existing projects are left intact and missing categories prevent a partial import", async () => {
  const { items, store } = fixture();
  const existing = { id: "fiorentini-bistro-moscow", title: "Owner's project" };
  items["projects:fiorentini-bistro-moscow"] = existing;
  assert.equal(await applyProjectRelease(store), 0);
  assert.equal(items["projects:fiorentini-bistro-moscow"], existing);
  const missing = fixture();
  delete missing.items["projectCategories:restaurant"];
  await assert.rejects(
    applyProjectRelease(missing.store),
    /category and sector/,
  );
  assert.equal(missing.items["projects:fiorentini-bistro-moscow"], undefined);
});
