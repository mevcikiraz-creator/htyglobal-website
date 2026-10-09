import type { Module, RecordItem } from "./content";
import { woods } from "./woods";
import {
  catalogAssets,
  catalogImages,
  catalogRevision,
} from "./catalog-assets";
type Store = {
  get: (module: Module, id: string) => Promise<RecordItem | undefined>;
  save: (module: Module, item: RecordItem) => Promise<unknown>;
};
export async function applyCatalogRelease(store: Store) {
  let updated = 0;
  for (const asset of catalogAssets) {
    const row = await store.get("products", asset.id);
    // Only replace untouched original demo imagery. Never recreate deleted products
    // or assign a demo object's material previews to a real, uploaded product.
    if (
      !row ||
      row.title !== asset.title ||
      row.data?.catalogRevision === catalogRevision ||
      woods.some((wood) => Boolean(row.data?.[wood.field])) ||
      !["/sample-chair.webp", "/sample-interior.webp"].includes(
        String(row.data?.image),
      )
    )
      continue;
    const category = await store.get("productCategories", asset.category);
    await store.save("products", {
      ...row,
      ...(category && row.categoryId === asset.legacyCategory
        ? { categoryId: category.id }
        : {}),
      data: {
        ...row.data,
        ...catalogImages(asset.model),
        ...(Array.isArray(row.data?.gallery) &&
        row.data.gallery.some(
          (url) =>
            !["/sample-chair.webp", "/sample-interior.webp"].includes(
              String(url),
            ),
        )
          ? { gallery: row.data.gallery }
          : {}),
      },
    });
    updated++;
  }
  const home = await store.get("pages", "home");
  if (home && !Object.hasOwn(home.data || {}, "heroVideo")) {
    await store.save("pages", {
      ...home,
      data: {
        ...home.data,
        heroVideo: "/videos/hty-story.mp4",
        heroVideoMode: "scroll",
      },
    });
    updated++;
  }
  return updated;
}
