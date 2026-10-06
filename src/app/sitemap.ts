import type { MetadataRoute } from "next";
import { published } from "@/lib/store";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.SITE_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  const routes = new Map<string, string | undefined>([
    ["", undefined],
    ["projects", undefined],
    ["products", undefined],
    ["sectors", undefined],
    ["news", undefined],
  ]);
  for (const page of await published("pages"))
    routes.set(page.slug === "home" ? "" : String(page.slug), page.updatedAt);
  for (const [mod, prefix] of [
    ["products", "products"],
    ["projects", "projects"],
    ["sectors", "sectors"],
    ["blog", "news"],
  ] as const)
    for (const row of await published(mod))
      routes.set(prefix + "/" + row.slug, row.updatedAt);
  return [...routes].flatMap(([route, lastModified]) =>
    ["", "tr/"].map((locale) => ({
      url: `${base}/${locale}${route}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: route ? 0.7 : 1,
    })),
  );
}
