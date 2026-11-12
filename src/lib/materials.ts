import type { RecordItem } from "./content";
import type { WoodId } from "./woods";

export const materialDescriptions: Record<WoodId, { en: string; tr: string }> =
  {
    beech: {
      en: "A light, even tone and fine grain bring a calm, understated character to furniture and finishes.",
      tr: "Açık ve dengeli tonu, ince damar yapısıyla mobilyalara ve yüzeylere sade bir karakter kazandırır.",
    },
    walnut: {
      en: "Rich brown tones and flowing grain add depth and a distinctive natural character to an interior.",
      tr: "Zengin kahverengi tonları ve akıcı damar yapısı, mekâna derinlik ve belirgin bir doğal karakter katar.",
    },
    oak: {
      en: "Pronounced grain and warm tones create a textured, natural expression across furniture forms.",
      tr: "Belirgin damarları ve sıcak tonları, farklı mobilya formlarında dokulu ve doğal bir görünüm oluşturur.",
    },
    ash: {
      en: "A pale tone and clear, straight grain offer a light, expressive appearance with a strong sense of texture.",
      tr: "Açık tonu ve belirgin, düz damar yapısı; dokusu öne çıkan, hafif ve canlı bir görünüm sunar.",
    },
  };

export function materialsPage(locale: string): RecordItem {
  const tr = locale === "tr";
  return {
    id: "materials",
    slug: "materials",
    status: "PUBLISHED",
    title: tr ? "Malzemeler\nve yüzeyler." : "Materials\n& finishes.",
    description: tr
      ? "Koleksiyonumuzdaki dört ahşap seçeneğini keşfedin. Damar, renk ve yüzey uygulaması her parçaya farklı bir karakter katar."
      : "Explore the four wood options in our collection. Grain, colour and finish give each piece its own character.",
  };
}
