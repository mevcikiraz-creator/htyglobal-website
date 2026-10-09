export const catalogRevision = "2026-10-09-wood-collection";
export const catalogAssets = [
  {
    id: "sample-product-1",
    title: "Arc lounge chair",
    model: "arc",
    category: "armchairs",
    legacyCategory: "chairs",
  },
  {
    id: "sample-product-2",
    title: "Linea dining table",
    model: "linea",
    category: "tables",
    legacyCategory: "armchairs",
  },
  {
    id: "sample-product-3",
    title: "Forma sofa",
    model: "forma",
    category: "sofas",
    legacyCategory: "sofas",
  },
  {
    id: "sample-product-4",
    title: "Noma cabinet",
    model: "noma",
    category: "cabinets",
    legacyCategory: "tables",
  },
  {
    id: "sample-product-5",
    title: "Atelier headboard",
    model: "atelier",
    category: "headboards",
    legacyCategory: "coffee-tables",
  },
  {
    id: "sample-product-6",
    title: "Contour armchair",
    model: "contour",
    category: "chairs",
    legacyCategory: "poufs",
  },
] as const;
export function catalogImages(model: string) {
  return {
    image: `/products/${model}-oak.webp`,
    gallery: [`/products/${model}-oak.webp`],
    defaultWood: "oak",
    woodBeechImage: `/products/${model}-beech.webp`,
    woodWalnutImage: `/products/${model}-walnut.webp`,
    woodOakImage: `/products/${model}-oak.webp`,
    woodAshImage: `/products/${model}-ash.webp`,
    catalogRevision,
  };
}
