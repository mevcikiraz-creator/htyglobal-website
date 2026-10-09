export const woods = [
  {
    id: "beech",
    field: "woodBeechImage",
    en: "Beech",
    tr: "Kayın ağacı",
    color: "#dcb88c",
    grain: "fine",
  },
  {
    id: "walnut",
    field: "woodWalnutImage",
    en: "Walnut",
    tr: "Ceviz ağacı",
    color: "#735139",
    grain: "flowing",
  },
  {
    id: "oak",
    field: "woodOakImage",
    en: "Oak",
    tr: "Meşe ağacı",
    color: "#be925d",
    grain: "open",
  },
  {
    id: "ash",
    field: "woodAshImage",
    en: "Ash",
    tr: "Dişbudak",
    color: "#e2cfaa",
    grain: "straight",
  },
] as const;
export type WoodId = (typeof woods)[number]["id"];
export function woodId(value: unknown): WoodId | undefined {
  return woods.find((wood) => wood.id === value)?.id;
}
export function woodPreviews(data: Record<string, unknown>) {
  return Object.fromEntries(
    woods.map((wood) => [
      wood.id,
      typeof data[wood.field] === "string" ? data[wood.field] : "",
    ]),
  ) as Record<WoodId, string>;
}
