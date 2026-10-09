"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Arrow from "./arrow";
import { woods, woodId, woodPreviews, type WoodId } from "@/lib/woods";
import type { RecordItem } from "@/lib/content";

export default function ProductDetail({
  product,
  category,
  locale,
  related,
}: {
  product: RecordItem;
  category?: string;
  locale: string;
  related: RecordItem[];
}) {
  const tr = locale === "tr",
    prefix = tr ? "/tr" : "";
  const data = product.data || {};
  const previews = woodPreviews(data);
  const preferredWood = woodId(data.defaultWood);
  const initialWood =
    (preferredWood && previews[preferredWood] ? preferredWood : undefined) ||
    woods.find((wood) => previews[wood.id])?.id;
  const [selected, setSelected] = useState<WoodId | undefined>(initialWood);
  const [view, setView] = useState(0);
  const [failed, setFailed] = useState("");
  const base = String(data.image || "/sample-chair.webp");
  const gallery = Array.isArray(data.gallery)
    ? data.gallery.filter(
        (url): url is string => typeof url === "string" && url !== base,
      )
    : [];
  const primary = (selected && previews[selected]) || base;
  const src = view === 0 ? primary : gallery[view - 1] || primary;
  const label = selected
    ? woods.find((wood) => wood.id === selected)![tr ? "tr" : "en"]
    : "";
  const quote = new URLSearchParams({
    product: String(product.slug),
    ...(selected ? { wood: selected } : {}),
  });
  return (
    <>
      <nav
        className="product-breadcrumb"
        aria-label={tr ? "Sayfa yolu" : "Breadcrumb"}
      >
        <Link href={prefix || "/"}>{tr ? "Ana sayfa" : "Home"}</Link>
        <span>/</span>
        <Link href={`${prefix}/products`}>{tr ? "Ürünler" : "Products"}</Link>
        <span>/</span>
        <span>{product.title}</span>
      </nav>
      <section className="product-detail-layout">
        <div className="product-visuals">
          <div className="product-stage" data-wood={selected || "none"}>
            <Image
              key={src}
              src={src}
              alt={`${product.title}${view === 0 && label ? ` — ${label}` : ""}`}
              fill
              preload
              sizes="(max-width: 900px) 100vw, 63vw"
              style={{ objectFit: "contain" }}
              onError={() => setFailed(src)}
            />
            <span className="product-view-label">
              {view === 0
                ? label || (tr ? "Ürün görünümü" : "Product view")
                : tr
                  ? "Detay görünümü"
                  : "Detail view"}
            </span>
          </div>
          {failed === src && (
            <p className="preview-warning" role="alert">
              {tr
                ? "Bu görsel yüklenemedi. Başka bir görünüm seçin."
                : "This preview could not load. Please choose another view."}
            </p>
          )}
          <div
            className="product-thumbnails"
            aria-label={tr ? "Ürün görünümleri" : "Product views"}
          >
            {[primary, ...gallery].map((url, i) => (
              <button
                key={`${i}-${url}`}
                type="button"
                aria-label={`${tr ? "Görünüm" : "View"} ${i + 1}`}
                aria-pressed={view === i}
                onClick={() => setView(i)}
              >
                <Image
                  src={url}
                  alt=""
                  width={120}
                  height={90}
                  style={{ objectFit: "contain" }}
                />
              </button>
            ))}
          </div>
        </div>
        <aside className="product-customize">
          <p className="eyebrow">
            {category || (tr ? "ÖZEL ÜRETİM" : "CONTRACT COLLECTION")} /{" "}
            {String(data.code || "HTY GLOBAL")}
          </p>
          <h1>{product.title}</h1>
          <p className="product-summary">{product.description}</p>
          <div className="customize-heading">
            <h2>{tr ? "Ürünü özelleştir" : "Customize"}</h2>
            <span>01</span>
          </div>
          <fieldset className="wood-choices">
            <legend>{tr ? "Ağaç seçimi" : "Choose your wood"}</legend>
            <div className="wood-options">
              {woods.map((wood) => (
                <button
                  type="button"
                  key={wood.id}
                  aria-label={wood[tr ? "tr" : "en"]}
                  aria-pressed={selected === wood.id}
                  disabled={!previews[wood.id]}
                  title={
                    !previews[wood.id]
                      ? tr
                        ? "Bu ürün için önizleme henüz eklenmedi"
                        : "Preview has not been added for this product"
                      : wood[tr ? "tr" : "en"]
                  }
                  onClick={() => {
                    setSelected(wood.id);
                    setView(0);
                    setFailed("");
                  }}
                >
                  <span
                    className={`wood-swatch wood-${wood.id}`}
                    style={{ backgroundColor: wood.color }}
                  />
                  <span>{wood[tr ? "tr" : "en"]}</span>
                </button>
              ))}
            </div>
            <p className="wood-selection" aria-live="polite">
              {selected
                ? `${tr ? "Seçiminiz" : "Your selection"}: ${label}`
                : tr
                  ? "Ağaç önizlemeleri bu ürün için hazırlanıyor."
                  : "Wood previews are being prepared for this product."}
            </p>
          </fieldset>
          <p className="material-note">
            {tr
              ? "Doğal ahşabın renk ve damarları parçaya göre farklılık gösterir. Son yüzeyi numune üzerinden birlikte belirleriz."
              : "Natural wood varies in colour and grain. We confirm the final finish together through a physical sample."}
          </p>
          <Link
            className="button dark product-quote"
            href={`${prefix}/quote?${quote}`}
          >
            {tr ? "Bu ürün için teklif al" : "Request a quote"}
            <Arrow />
          </Link>
          <p className="product-made">
            {tr
              ? "Projenize özel ölçü, kumaş ve üretim seçenekleri."
              : "Made to your project. Bespoke dimensions, upholstery and production."}
          </p>
          <details open>
            <summary>
              {tr ? "Ürün detayları" : "Product details"}
              <span>+</span>
            </summary>
            <p>{String(data.body || product.description || "")}</p>
          </details>
          <details>
            <summary>
              {tr ? "Ölçüler ve malzemeler" : "Dimensions & materials"}
              <span>+</span>
            </summary>
            <dl>
              {["dimensions", "materials", "finishes"]
                .filter((key) => data[key])
                .map((key) => (
                  <div key={key}>
                    <dt>
                      {
                        (
                          {
                            dimensions: tr ? "Ölçüler" : "Dimensions",
                            materials: tr ? "Malzemeler" : "Materials",
                            finishes: tr ? "Yüzeyler" : "Finishes",
                          } as Record<string, string>
                        )[key]
                      }
                    </dt>
                    <dd>{String(data[key])}</dd>
                  </div>
                ))}
            </dl>
          </details>
          {typeof data.pdf === "string" && data.pdf && (
            <a
              className="text-link"
              href={data.pdf}
              target="_blank"
              rel="noopener noreferrer"
            >
              {tr ? "Teknik dosyayı indir" : "Download specification"}
              <Arrow />
            </a>
          )}
        </aside>
      </section>
      {related.length > 0 && (
        <section className="section related-products">
          <div className="section-heading">
            <h2>{tr ? "Birlikte düşünün." : "Considered companions."}</h2>
            <Link className="text-link" href={`${prefix}/products`}>
              {tr ? "Tüm ürünler" : "All products"}
              <Arrow />
            </Link>
          </div>
          <div className="product-grid">
            {related.map((item) => (
              <Link
                className="product-card"
                key={item.id}
                href={`${prefix}/products/${item.slug}`}
              >
                <div className="product-card-image">
                  <Image
                    src={String(item.data?.image || "/sample-chair.webp")}
                    alt={String(item.title)}
                    fill
                    sizes="(max-width: 700px) 50vw, 30vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <h3>{item.title}</h3>
                <span>{String(item.data?.code || "")}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
