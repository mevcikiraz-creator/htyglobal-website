import { test } from "node:test";
import assert from "node:assert/strict";
import { applyCatalogRelease } from "../src/lib/catalog-release";
import type { Module, RecordItem } from "../src/lib/content";

test("catalog release updates old samples and preserves custom copy, galleries and home settings", async () => {
  const items: Record<string, RecordItem> = {
    "products:sample-product-1": {
      id: "sample-product-1",
      title: "Arc lounge chair",
      categoryId: "chairs",
      data: {
        image: "/sample-chair.webp",
        body: "My custom copy",
        gallery: ["/my-custom-detail.webp"],
      },
    },
    "productCategories:armchairs": { id: "armchairs", title: "Armchairs" },
    "pages:home": {
      id: "home",
      data: { introTitle: "Keep this heading", image: "/custom-home.webp" },
    },
  };
  const store = {
    get: async (module: Module, id: string) => items[`${module}:${id}`],
    save: async (module: Module, item: RecordItem) => {
      items[`${module}:${item.id}`] = item;
    },
  };
  assert.equal(await applyCatalogRelease(store), 2);
  const product = items["products:sample-product-1"];
  assert.equal(product.categoryId, "armchairs");
  assert.equal(product.data?.body, "My custom copy");
  assert.deepEqual(product.data?.gallery, ["/my-custom-detail.webp"]);
  assert.equal(product.data?.woodWalnutImage, "/products/arc-walnut.webp");
  assert.equal(items["pages:home"].data?.introTitle, "Keep this heading");
  assert.equal(items["pages:home"].data?.image, "/custom-home.webp");
  assert.equal(await applyCatalogRelease(store), 0);
});
test("catalog release leaves uploaded products, chosen categories and custom films intact", async () => {
  const uploaded: RecordItem = {
    id: "sample-product-1",
    title: "Arc lounge chair",
    categoryId: "chairs",
    data: { image: "/our-real-chair.webp" },
  };
  const old: RecordItem = {
    id: "sample-product-2",
    title: "Linea dining table",
    categoryId: "custom-furniture",
    data: { image: "/sample-chair.webp" },
  };
  const home: RecordItem = {
    id: "home",
    data: {
      heroVideo: "https://cdn.example.com/our-film.mp4",
      heroVideoMode: "loop",
    },
  };
  const items: Record<string, RecordItem> = {
    "products:sample-product-1": uploaded,
    "products:sample-product-2": old,
    "pages:home": home,
    "productCategories:tables": { id: "tables" },
  };
  const writes: string[] = [];
  await applyCatalogRelease({
    get: async (module, id) => items[`${module}:${id}`],
    save: async (module, item) => {
      writes.push(`${module}:${item.id}`);
      items[`${module}:${item.id}`] = item;
    },
  });
  assert.deepEqual(writes, ["products:sample-product-2"]);
  assert.equal(
    items["products:sample-product-2"].categoryId,
    "custom-furniture",
  );
  assert.equal(items["products:sample-product-1"], uploaded);
  assert.equal(items["pages:home"], home);
});
