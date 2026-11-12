import Link from "next/link";
import Arrow from "@/components/arrow";
import { materialDescriptions } from "@/lib/materials";
import { woods } from "@/lib/woods";

export default function Materials({ locale }: { locale: string }) {
  const tr = locale === "tr";
  const prefix = tr ? "/tr" : "";
  return (
    <section className="section materials-section">
      <div className="materials-grid">
        {woods.map((wood, index) => (
          <article className="material-card" key={wood.id}>
            <span className="eyebrow">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span
              className={`wood-swatch wood-${wood.id} material-swatch`}
              style={{ backgroundColor: wood.color }}
              aria-hidden="true"
            />
            <h2>{tr ? wood.tr : wood.en}</h2>
            <p>{materialDescriptions[wood.id][tr ? "tr" : "en"]}</p>
          </article>
        ))}
      </div>
      <div className="materials-note">
        <p>
          {tr
            ? "Renk ve damar yapısı doğal olarak değişir. Ekrandaki renkler temsilidir; nihai malzemeyi ve yüzeyi fiziksel numuneyle değerlendirin."
            : "Colour and grain vary naturally. Preview colours are illustrative; confirm the final material and finish with a physical sample."}
        </p>
        <Link className="text-link" href={`${prefix}/products`}>
          {tr ? "Koleksiyonu inceleyin" : "View the collection"} <Arrow />
        </Link>
      </div>
    </section>
  );
}
