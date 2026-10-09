import Image from "next/image";
import Link from "next/link";
import Arrow from "./arrow";
import type { RecordItem } from "@/lib/content";
export default function ProductCatalog({
  products,
  categories,
  locale,
  selected = "",
  query = "",
  sort = "",
  view = "4",
}: {
  products: RecordItem[];
  categories: RecordItem[];
  locale: string;
  selected?: string;
  query?: string;
  sort?: string;
  view?: string;
}) {
  const columns = view === "6" ? 6 : 4;
  const tr = locale === "tr",
    prefix = tr ? "/tr" : "";
  const search = query
    .trim()
    .toLocaleLowerCase(tr ? "tr" : "en")
    .slice(0, 100);
  const results = products.filter(
    (item) =>
      (!selected || item.categoryId === selected) &&
      (!search ||
        `${item.title} ${item.data?.code || ""}`
          .toLocaleLowerCase(tr ? "tr" : "en")
          .includes(search)),
  );
  if (sort === "name")
    results.sort((a, b) =>
      String(a.title).localeCompare(String(b.title), locale),
    );
  const href = (category = "", viewColumns = columns) => {
    const params = new URLSearchParams({
      ...(category ? { category } : {}),
      ...(query ? { q: query } : {}),
      ...(sort ? { sort } : {}),
      view: String(viewColumns),
    });
    return `${prefix}/products${params.size ? `?${params}` : ""}`;
  };
  return (
    <section className="catalog-page">
      <header className="catalog-heading">
        <p className="eyebrow">
          HTY GLOBAL / {tr ? "KOLEKSİYON" : "THE COLLECTION"}
        </p>
        <h1>
          {tr
            ? "Mekânınız için.\nSizin seçiminiz."
            : "For your space.\nBy your choice."}
        </h1>
        <p>
          {tr
            ? "Hastane, otel, restoran, kafe ve ofis için mobilyalar. Projenize göre şekillenen ölçüler, malzemeler ve detaylar."
            : "Furniture for healthcare, hospitality, restaurants, cafés and workplaces. Dimensions, materials and details shaped around your project."}
        </p>
      </header>
      <div className="catalog-layout">
        <aside className="catalog-sidebar">
          <h2>{tr ? "Ürün kategorileri" : "Product categories"}</h2>
          <nav className="catalog-categories" aria-label="Categories">
            <Link
              aria-current={!selected ? "page" : undefined}
              className={!selected ? "selected" : ""}
              href={href()}
            >
              <span>{tr ? "Tümü" : "All"}</span>
              <small>{products.length}</small>
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={href(category.id)}
                aria-current={selected === category.id ? "page" : undefined}
                className={selected === category.id ? "selected" : ""}
              >
                <span>{category.title}</span>
                <small>
                  {
                    products.filter((item) => item.categoryId === category.id)
                      .length
                  }
                </small>
              </Link>
            ))}
          </nav>
          <p className="catalog-bespoke">
            {tr
              ? "Aradığınız ürün burada yok mu? Birlikte üretelim."
              : "A piece you have in mind? Let’s make it together."}
          </p>
          <Link className="text-link" href={`${prefix}/quote`}>
            {tr ? "Özel üretim" : "Bespoke enquiries"}
            <Arrow />
          </Link>
        </aside>
        <div className="catalog-results">
          <div className="catalog-toolbar">
            <span role="status">
              {results.length} {tr ? "ürün" : "products"}
            </span>
            <form action={`${prefix}/products`} method="get">
              <input type="hidden" name="view" value={columns} />
              {selected && (
                <input type="hidden" name="category" value={selected} />
              )}
              <label className="catalog-search">
                <span className="sr-only">
                  {tr ? "Ürün ara" : "Search products"}
                </span>
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={tr ? "Ürün veya kod ara" : "Search products"}
                  maxLength={100}
                />
                <button type="submit" aria-label={tr ? "Ara" : "Search"}>
                  <Arrow />
                </button>
              </label>
              <label className="catalog-sort">
                <span className="sr-only">
                  {tr ? "Sıralama" : "Sort products"}
                </span>
                <select name="sort" defaultValue={sort}>
                  <option value="">{tr ? "Önerilen" : "Recommended"}</option>
                  <option value="name">
                    {tr ? "İsme göre A–Z" : "Name A–Z"}
                  </option>
                </select>
              </label>
            </form>
            <nav
              className="catalog-view"
              aria-label={tr ? "Satırdaki ürün sayısı" : "Products per row"}
            >
              <span>{tr ? "Görünüm" : "View"}</span>
              {[4, 6].map((count) => (
                <Link
                  key={count}
                  href={href(selected, count)}
                  scroll={false}
                  aria-current={columns === count ? "true" : undefined}
                  aria-label={
                    tr ? `Satırda ${count} ürün` : `${count} products per row`
                  }
                >
                  {tr ? `${count}’lü` : `${count} / row`}
                </Link>
              ))}
            </nav>
          </div>
          {results.length ? (
            <div
              className={`product-grid catalog-product-grid columns-${columns}`}
            >
              {results.map((item) => (
                <Link
                  className="product-card"
                  href={`${prefix}/products/${item.slug}`}
                  key={item.id}
                >
                  <div className="product-card-image">
                    <Image
                      src={String(item.data?.image || "/sample-chair.webp")}
                      alt={String(item.data?.imageAlt || item.title)}
                      fill
                      sizes={`(max-width: 600px) 50vw, (max-width: 1100px) 38vw, ${columns === 6 ? "13vw" : "20vw"}`}
                      style={{ objectFit: "contain" }}
                    />
                    <span className="product-card-open">
                      <Arrow />
                    </span>
                  </div>
                  <div className="product-card-caption">
                    <h3>{item.title}</h3>
                    <span>{String(item.data?.code || "")}</span>
                  </div>
                  <p>
                    {
                      categories.find(
                        (category) => category.id === item.categoryId,
                      )?.title
                    }
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="catalog-empty">
              <h2>
                {tr ? "Birlikte tasarlayalım." : "Let’s design it together."}
              </h2>
              <p>
                {tr
                  ? "Bu seçime uygun ürün henüz eklenmedi. Özel üretim ihtiyaçlarınız için bize yazın."
                  : "No products match this selection yet. Talk to us about your bespoke requirements."}
              </p>
              <Link className="text-link" href={href()}>
                {tr ? "Tüm ürünlere dön" : "View all products"}
                <Arrow />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
