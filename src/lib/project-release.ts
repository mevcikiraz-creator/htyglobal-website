import type { Module, RecordItem } from "./content";

const slug = "fiorentini-bistro-moscow";
const releaseId = "project-release-fiorentini-bistro-moscow-v1";
const image = (index: number) =>
  `/projects/${slug}/${String(index).padStart(2, "0")}.webp`;

type Store = {
  get: (module: Module, id: string) => Promise<RecordItem | undefined>;
  save: (module: Module, item: RecordItem) => Promise<unknown>;
};

// Import once. Later CMS edits and deletions must survive every deployment.
export async function applyProjectRelease(store: Store) {
  if (await store.get("settings", releaseId)) return 0;
  const existing = await store.get("projects", slug);
  if (!existing) {
    const category = await store.get("projectCategories", "restaurant");
    const sector = await store.get("sectors", "restaurant-cafe");
    if (!category || !sector)
      throw new Error(
        "Restaurant category and sector are required for the project import.",
      );
    await store.save("projects", {
      id: slug,
      slug,
      title: "Fiorentini Bistro",
      description:
        "A restaurant in Moscow, Russia, where warm wood tones, upholstered seating and greenery shape an inviting dining space.",
      status: "PUBLISHED",
      featured: true,
      sortOrder: -1,
      categoryId: category.id,
      sectorId: sector.id,
      data: {
        image: image(1),
        gallery: Array.from({ length: 11 }, (_, i) => image(i + 2)),
        location: "Moscow",
        country: "Russia",
        body: "Fiorentini Bistro brings together dining tables, upholstered chairs and banquette seating in Moscow. Warm wood tones, layered lighting and abundant greenery create a cohesive restaurant interior. Explore the space and its details in the project photographs below.",
      },
      translations: {
        tr: {
          title: "Fiorentini Bistro",
          description:
            "Rusya’nın Moskova şehrinde ahşabın sıcak tonlarını, döşemeli oturma alanlarını ve yeşil dokuları bir araya getiren restoran.",
          data: {
            location: "Moskova",
            country: "Rusya",
            body: "Moskova’daki Fiorentini Bistro; yemek masaları, döşemeli sandalyeler ve bank oturma alanlarını aynı mekânda buluşturuyor. Ahşabın sıcak tonları, farklı aydınlatma katmanları ve yeşil dokular restoranın bütünlüklü atmosferini oluşturuyor. Mekânı ve detaylarını aşağıdaki proje fotoğraflarında inceleyebilirsiniz.",
          },
        },
      },
    });
  }
  await store.save("settings", {
    id: releaseId,
    slug: releaseId,
    title: "Fiorentini Bistro project import",
    status: "DRAFT",
    data: { imported: true, projectSlug: slug },
  });
  return existing ? 0 : 1;
}
