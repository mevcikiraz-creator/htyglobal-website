import Arrow from "@/components/arrow";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { published } from "@/lib/store";
import { type RecordItem, type Module, images } from "@/lib/content";
import Nav from "@/components/nav";
import ProductCatalog from "@/components/product-catalog";
import ProductDetail from "@/components/product-detail";
import HomeFilm from "@/components/home-film";
import { woodId } from "@/lib/woods";
import { InquiryForm } from "@/components/forms";
export const dynamic = "force-dynamic";
type Props = {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
    view?: string;
    product?: string;
    wood?: string;
  }>;
};
const text = (v: unknown, fallback = "") =>
  typeof v === "string" && v.trim() ? v : fallback;
const tr: Record<string, string> = {
  "Discuss your project": "Projenizi konuşalım",
  "The story behind our craft": "Ustalığımızın hikâyesi",
  "All projects": "Tüm projeler",
  "Explore products": "Ürünleri keşfedin",
  "Inside our process": "Üretim sürecimiz",
  "Start a project": "Proje başlatın",
  Journal: "Haberler",
  Administration: "Yönetim",
  All: "Tümü",
  "In good company.": "İlgili çalışmalar.",
  "Selected for this setting.": "Bu mekân için seçildi.",
  "No entries in this category yet.": "Bu kategoride henüz içerik yok.",
  "WORKING TOGETHER": "BİRLİKTE ÇALIŞIYORUZ",
  "THE NEXT CHAPTER": "BİR SONRAKİ ADIM",
  "Explore project": "Projeyi keşfedin",
};
const translate = (locale: string, key: string) =>
  locale === "tr" ? tr[key] || key : key;
function resolve(paths: string[] = []) {
  const locale = paths[0] === "tr" ? "tr" : "en";
  const parts = locale === "tr" ? paths.slice(1) : paths;
  return { locale, parts, prefix: locale === "tr" ? "/tr" : "" };
}
async function content(parts: string[], locale: string) {
  const type = parts[0] || "home";
  const mod = (
    {
      products: "products",
      projects: "projects",
      sectors: "sectors",
      news: "blog",
    } as Record<string, Module>
  )[type];
  if (mod && parts[1])
    return (await published(mod, locale)).find((x) => x.slug === parts[1]);
  return (await published("pages", locale)).find((x) => x.slug === type);
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { path = [] } = await params;
  const { parts, locale } = resolve(path);
  const entry = await content(parts, locale);
  const settings = (await published("settings", locale))[0];
  const data = entry?.data || {};
  const brand = text(settings?.title, "HTY Global");
  const defaultTitle = text(
    settings?.data?.seoTitle,
    `${brand} — Contract Furniture`,
  );
  const pageTitle =
    entry?.title?.replaceAll("\n", " ") ||
    (
      {
        projects: locale === "tr" ? "Projeler" : "Projects",
        products: locale === "tr" ? "Ürünler" : "Products",
        sectors: locale === "tr" ? "Sektörler" : "Sectors",
        news: locale === "tr" ? "Haberler" : "Journal",
      } as Record<string, string>
    )[parts[0]] ||
    brand;
  const title = text(
    data.seoTitle,
    !parts.length ? defaultTitle : `${pageTitle} | ${brand}`,
  );
  const description = text(
    data.seoDescription,
    entry?.description || text(settings?.data?.seoDescription),
  );
  const url =
    (process.env.SITE_URL || "http://localhost:3000") + "/" + path.join("/");
  return {
    metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en:
          (process.env.SITE_URL || "http://localhost:3000") +
          "/" +
          parts.join("/"),
        tr:
          (process.env.SITE_URL || "http://localhost:3000") +
          "/tr/" +
          parts.join("/"),
      },
    },
    openGraph: {
      title,
      description,
      url,
      images: data.image ? [text(data.image)] : [],
    },
    twitter: { card: "summary_large_image", title, description },
    icons: settings?.data?.favicon
      ? { icon: text(settings.data.favicon) }
      : undefined,
  };
}
function Picture({
  src,
  alt,
  hero = false,
}: {
  src: string;
  alt: string;
  hero?: boolean;
}) {
  return (
    <div className={hero ? "picture hero-picture" : "picture"}>
      <Image
        src={src}
        alt={alt}
        fill
        preload={hero}
        sizes={hero ? "100vw" : "(max-width: 700px) 100vw, 50vw"}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
function Grid({
  items,
  base,
  prefix,
}: {
  items: RecordItem[];
  base: string;
  prefix: string;
}) {
  return (
    <div className="editorial-grid">
      {items.map((x, i) => (
        <Link className="work" href={`${prefix}/${base}/${x.slug}`} key={x.id}>
          <Picture
            src={text(x.data?.image, images[i % images.length])}
            alt={text(x.data?.imageAlt, x.title)}
          />
          <div className="work-caption">
            <h3>{x.title}</h3>
            <span>
              {text(
                x.data?.location,
                base === "products" ? text(x.data?.code) : "Explore project",
              )}{" "}
              <Arrow />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
function Statistics({ values }: { values: unknown }) {
  if (!Array.isArray(values)) return null;
  const entries = values.filter(
    (value) => Array.isArray(value) && value.length >= 2,
  );
  if (!entries.length) return null;
  return (
    <section className="section stats">
      {entries.map((stat, i) => (
        <div key={i}>
          <strong>{String(stat[0])}</strong>
          <p>{String(stat[1])}</p>
        </div>
      ))}
    </section>
  );
}
function Cta({ prefix, title }: { prefix: string; title: string }) {
  return (
    <section className="cta">
      <p className="eyebrow">
        {translate(prefix ? "tr" : "en", "THE NEXT CHAPTER")}
      </p>
      <h2>{title}</h2>
      <Link className="button" href={`${prefix}/quote`}>
        {translate(prefix ? "tr" : "en", "Discuss your project")}{" "}
        <span>
          <Arrow />
        </span>
      </Link>
    </section>
  );
}
export default async function Page({ params, searchParams }: Props) {
  const { path = [] } = await params;
  const { locale, parts, prefix } = resolve(path);
  const type = parts[0] || "home";
  if (parts.length > 2) notFound();
  const [projects, products, sectors, clients, settings] = await Promise.all([
    published("projects", locale),
    published("products", locale),
    published("sectors", locale),
    published("clients", locale),
    published("settings", locale),
  ]);
  const site = settings[0] || {};
  const d = site.data || {};
  const entry = await content(parts, locale);
  const detail = parts.length === 2;
  if (detail && !["projects", "products", "sectors", "news"].includes(type))
    notFound();
  const collection = (
    {
      projects,
      products,
      sectors,
      news: await published("blog", locale),
    } as Record<string, RecordItem[]>
  )[type];
  if (detail && !entry) notFound();
  if (!entry && !collection) notFound();
  const home = type === "home";
  const title =
    entry?.title ||
    (locale === "tr"
      ? (
          {
            projects: "Özenle üretilen mekânlar.",
            products: "Amacı olan tasarımlar.",
            sectors: "Her mekâna özel üretim.",
            news: "Bizim bakış açımız.",
          } as Record<string, string>
        )[type]
      : undefined) ||
    (
      {
        projects: "Spaces, thoughtfully made.",
        products: "Objects with purpose.",
        sectors: "Made for every setting.",
        news: "From our perspective.",
      } as Record<string, string>
    )[type];
  const ed = entry?.data || {};
  const categories =
    collection && ["projects", "products"].includes(type)
      ? await published(
          type === "projects" ? "projectCategories" : "productCategories",
          locale,
        )
      : [];
  if (entry?.sectorId)
    ed.sector = sectors.find((s) => s.id === entry.sectorId)?.title;
  if (entry?.categoryId)
    ed.category = categories.find((c) => c.id === entry.categoryId)?.title;
  const homeCategories = home
    ? await published("productCategories", locale)
    : [];
  const search = await searchParams;
  const selected = search.category;
  const quoteProduct =
    type === "quote"
      ? products.find((product) => product.slug === search.product)
      : undefined;
  const quoteWood = quoteProduct ? woodId(search.wood) : undefined;
  const filtered = collection?.filter(
    (x) => !selected || x.categoryId === selected,
  );
  return (
    <>
      <Nav
        locale={locale}
        brand={site.title}
        logo={text(d.logo)}
        transparent={home}
      />
      <main>
        {type === "products" ? (
          <>
            {detail && entry ? (
              <ProductDetail
                key={entry.id}
                product={entry}
                category={text(ed.category)}
                locale={locale}
                related={products
                  .filter((product) => product.id !== entry.id)
                  .slice(0, 3)}
              />
            ) : (
              <ProductCatalog
                products={products}
                categories={categories}
                locale={locale}
                selected={selected}
                query={search.q}
                sort={search.sort}
                view={search.view}
              />
            )}
            <Cta
              prefix={prefix}
              title={
                locale === "tr"
                  ? "Projenize göre üretelim."
                  : "Made around your project."
              }
            />
          </>
        ) : home ? (
          <>
            <HomeFilm
              title={title}
              eyebrow={
                locale === "tr"
                  ? "İSTANBUL’DA ÜRETİLDİ. DÜNYA İÇİN TASARLANDI."
                  : text(ed.eyebrow)
              }
              poster={text(ed.image, images[0])}
              video={
                typeof ed.heroVideo === "string"
                  ? ed.heroVideo
                  : "/videos/hty-story.mp4"
              }
              mode={text(ed.heroVideoMode, "scroll")}
              locale={locale}
            />
            <section className="intro section" id="our-story">
              <p className="eyebrow">01 / A PARTNER IN YOUR VISION</p>
              <h2>{text(ed.introTitle, "Your vision. Our craft.")}</h2>
              <div>
                <p className="lead">{entry?.description}</p>
                <Link className="text-link" href={`${prefix}/about`}>
                  {translate(locale, "The story behind our craft")} <Arrow />
                </Link>
              </div>
            </section>
            <section className="section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">02 / SELECTED WORK</p>
                  <h2>
                    {text(
                      ed.selectedWorkTitle,
                      locale === "tr"
                        ? "Yaşadığımız mekânlar\niçin üretildi."
                        : "Made for the way\nwe live.",
                    )}
                  </h2>
                </div>
                <Link className="text-link" href={`${prefix}/projects`}>
                  {translate(locale, "All projects")} <Arrow />
                </Link>
              </div>
              <Grid
                items={projects.filter((x) => x.featured).slice(0, 4)}
                base="projects"
                prefix={prefix}
              />
              <p className="sample-note">
                {text(
                  ed.sampleNotice,
                  "Illustrative sample portfolio and AI-generated imagery. Replace with verified HTY Global work before launch.",
                )}
              </p>
            </section>
            <section className="product-section section">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">03 / THE COLLECTION</p>
                  <h2>
                    {text(
                      ed.productTitle,
                      locale === "tr"
                        ? "Form ve malzemenin\nortak dili."
                        : "A language of\nform & material.",
                    )}
                  </h2>
                </div>
                <Link className="text-link" href={`${prefix}/products`}>
                  {translate(locale, "Explore products")} <Arrow />
                </Link>
              </div>
              <Grid
                items={products.filter((x) => x.featured).slice(0, 2)}
                base="products"
                prefix={prefix}
              />
              <nav className="category-links" aria-label="Product categories">
                {homeCategories.map((c) => (
                  <Link key={c.id} href={`${prefix}/products?category=${c.id}`}>
                    {c.title}
                  </Link>
                ))}
              </nav>
            </section>
            <section className="section sector-section">
              <p className="eyebrow">04 / OUR EXPERTISE</p>
              <h2>
                {text(
                  ed.sectorTitle,
                  locale === "tr"
                    ? "Farklı mekânlar.\nAynı özen."
                    : "Different spaces.\nThe same attention.",
                )}
              </h2>
              <div className="sector-list">
                {sectors.map((s, i) => (
                  <Link href={`${prefix}/sectors/${s.slug}`} key={s.id}>
                    <span>0{i + 1}</span>
                    <h3>{s.title}</h3>
                    <span>
                      <Arrow />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
            <section className="manufacturing-teaser">
              <Picture
                src={text(ed.manufacturingImage, images[2])}
                alt="Natural material and architectural craftsmanship"
              />
              <div>
                <p className="eyebrow">05 / FROM OUR WORKSHOP</p>
                <h2>{text(ed.manufacturingTitle)}</h2>
                <p>
                  {text(
                    ed.manufacturingText,
                    "Precision in production. Care in every connection. Fixed, loose and bespoke furniture, brought together by one manufacturing partner.",
                  )}
                </p>
                <Link className="text-link" href={`${prefix}/manufacturing`}>
                  {translate(locale, "Inside our process")} <Arrow />
                </Link>
              </div>
            </section>
            <Statistics values={ed.statistics} />
            <section className="section clients">
              <p className="eyebrow">{translate(locale, "WORKING TOGETHER")}</p>
              <div>
                {clients.map((c) => (
                  <span key={c.id}>
                    {text(c.data?.logo) ? (
                      <Image
                        src={text(c.data?.logo)}
                        alt={c.title || "Client logo"}
                        width={150}
                        height={60}
                      />
                    ) : (
                      c.title
                    )}
                  </span>
                ))}
              </div>
            </section>
            <Cta
              prefix={prefix}
              title={text(ed.ctaTitle, "Let’s make something remarkable.")}
            />
          </>
        ) : (
          <>
            <section className="page-heading">
              <p className="eyebrow">HTY GLOBAL / {type.toUpperCase()}</p>
              <h1>{title}</h1>
              {entry?.description && (
                <p className="lead">{entry.description}</p>
              )}
            </section>
            {collection && !detail && (
              <section className="section collection">
                <nav className="filters" aria-label="Categories">
                  <Link
                    className={!selected ? "selected" : ""}
                    href={`${prefix}/${type}`}
                  >
                    {translate(locale, "All")}
                  </Link>
                  {categories.map((c) => (
                    <Link
                      className={selected === c.id ? "selected" : ""}
                      key={c.id}
                      href={`${prefix}/${type}?category=${c.id}`}
                    >
                      {c.title}
                    </Link>
                  ))}
                </nav>
                {filtered?.length ? (
                  <Grid items={filtered} base={type} prefix={prefix} />
                ) : (
                  <p>{translate(locale, "No entries in this category yet.")}</p>
                )}
              </section>
            )}
            {entry && !["contact", "quote"].includes(type) && !home && (
              <>
                <Picture
                  src={text(ed.image, images[1])}
                  alt={text(ed.imageAlt, title)}
                  hero
                />
                {!detail && text(ed.body) && (
                  <section className="section story-body">
                    <p className="lead">{text(ed.body)}</p>
                  </section>
                )}
                {detail && (
                  <section className="section detail">
                    <div className="specs">
                      {[
                        "category",
                        "sector",
                        "location",
                        "country",
                        "year",
                        "client",
                        "scope",
                        "code",
                        "dimensions",
                        "materials",
                        "finishes",
                        "specifications",
                        "capabilities",
                      ]
                        .filter((k) => ed[k])
                        .map((k) => (
                          <div key={k}>
                            <span>{k}</span>
                            <p>{text(ed[k])}</p>
                          </div>
                        ))}
                    </div>
                    <p className="lead">{text(ed.body, entry.description)}</p>
                    {text(ed.pdf) && (
                      <a className="text-link" href={text(ed.pdf)}>
                        Download specification <Arrow />
                      </a>
                    )}
                    {text(ed.video) && (
                      <a className="text-link" href={text(ed.video)}>
                        Watch project video <Arrow />
                      </a>
                    )}
                  </section>
                )}
                {Array.isArray(ed.sections) && (
                  <section className="section story-sections">
                    {ed.sections.map((s, i) => (
                      <article key={i}>
                        <span className="eyebrow">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2>{String((s as string[])[0])}</h2>
                        <p>{String((s as string[])[1])}</p>
                      </article>
                    ))}
                  </section>
                )}
                <Statistics values={ed.statistics} />
                {Array.isArray(ed.gallery) && (
                  <section className="section gallery">
                    {ed.gallery.map((url, i) => (
                      <Picture
                        key={i}
                        src={String(url)}
                        alt={`${title} — detail ${i + 1}`}
                      />
                    ))}
                  </section>
                )}
                {type === "sectors" && (
                  <section className="section">
                    <h2>{translate(locale, "Selected for this setting.")}</h2>
                    <Grid
                      items={projects.filter((x) => x.sectorId === entry.id)}
                      base="projects"
                      prefix={prefix}
                    />
                    <Grid
                      items={products.filter((x) => x.sectorId === entry.id)}
                      base="products"
                      prefix={prefix}
                    />
                  </section>
                )}
                {detail && ["products", "projects"].includes(type) && (
                  <section className="section">
                    <h2>{translate(locale, "In good company.")}</h2>
                    <Grid
                      items={(type === "products" ? products : projects)
                        .filter(
                          (x) =>
                            x.id !== entry.id &&
                            x.categoryId === entry.categoryId,
                        )
                        .slice(0, 2)}
                      base={type}
                      prefix={prefix}
                    />
                  </section>
                )}
              </>
            )}
            {["contact", "quote"].includes(type) ? (
              <section className="section contact-layout">
                <aside>
                  <p className="eyebrow">ISTANBUL · TÜRKİYE</p>
                  <h2>
                    Made here.
                    <br />
                    Connected everywhere.
                  </h2>
                  <p>{text(d.address)}</p>
                  {text(d.email) && (
                    <a href={`mailto:${text(d.email)}`}>{text(d.email)}</a>
                  )}
                  {text(d.phone) && (
                    <a href={`tel:${text(d.phone)}`}>{text(d.phone)}</a>
                  )}
                  {text(d.whatsapp) && (
                    <a
                      href={`https://wa.me/${text(d.whatsapp).replace(/\D/g, "")}`}
                    >
                      WhatsApp
                    </a>
                  )}
                  <div className="map-placeholder">
                    ISTANBUL
                    <br />
                    <small>
                      Map integration available when the office address is
                      confirmed.
                    </small>
                  </div>
                </aside>
                <InquiryForm
                  quote={type === "quote"}
                  locale={locale}
                  product={
                    quoteProduct
                      ? {
                          slug: String(quoteProduct.slug),
                          title: String(quoteProduct.title),
                          code: text(quoteProduct.data?.code),
                          wood: quoteWood,
                        }
                      : undefined
                  }
                />
              </section>
            ) : (
              <Cta
                prefix={prefix}
                title={
                  locale === "tr"
                    ? "Bir projeniz mi var?\nBirlikte hayata geçirelim."
                    : "A project in mind?\nLet’s bring it to life."
                }
              />
            )}
          </>
        )}
      </main>
      <footer>
        <div className="footer-top">
          <Link className="brand" href={prefix || "/"}>
            {site.title || "HTY GLOBAL"}
            <small>CONTRACT FURNITURE</small>
          </Link>
          <p>{text(d.footer)}</p>
          <Link href={`${prefix}/quote`}>
            {translate(locale, "Start a project")} <Arrow />
          </Link>
        </div>
        <div className="footer-links">
          <span>{text(d.address)}</span>
          {["linkedin", "instagram", "youtube"]
            .filter((k) => d[k])
            .map((k) => (
              <a key={k} href={text(d[k])} rel="noopener noreferrer">
                {k} <Arrow />
              </a>
            ))}
          <Link href={`${prefix}/news`}>{translate(locale, "Journal")}</Link>
          <Link href="/admin">{translate(locale, "Administration")}</Link>
        </div>
        {text(d.imageryNotice) && (
          <p className="sample-note">{text(d.imageryNotice)}</p>
        )}
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.title || "HTY Global"}
          </span>
          <span>CONSIDERED FROM EVERY ANGLE.</span>
        </div>
      </footer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": detail && type === "products" ? "Product" : "Organization",
            name: detail && type === "products" ? title : site.title,
            url: process.env.SITE_URL || "http://localhost:3000",
            description: entry?.description || site.description,
            ...(detail && type === "products"
              ? { image: text(ed.image), sku: text(ed.code) }
              : {
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Istanbul",
                    addressCountry: "TR",
                  },
                }),
          }).replaceAll("<", "\\u003c"),
        }}
      />
    </>
  );
}
