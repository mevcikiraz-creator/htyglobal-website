import { catalogAssets, catalogImages } from "./catalog-assets";
export const modules = [
  "products",
  "productCategories",
  "projects",
  "projectCategories",
  "sectors",
  "pages",
  "clients",
  "blog",
  "settings",
  "contacts",
  "quotes",
  "media",
  "users",
] as const;
export type Module = (typeof modules)[number];
export type RecordItem = {
  id: string;
  slug?: string;
  title?: string;
  description?: string;
  status?: string;
  featured?: boolean;
  sortOrder?: number;
  data?: Record<string, unknown>;
  translations?: Record<
    string,
    { title?: string; description?: string; data?: Record<string, unknown> }
  >;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
};
export const photo = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2200&q=85`;
export const images = Array.from({ length: 5 }, () => "/sample-interior.webp");
export function sampleData(): Record<Module, RecordItem[]> {
  const db = Object.fromEntries(
    modules.map((m) => [m, []]),
  ) as unknown as Record<Module, RecordItem[]>;
  const item = (
    id: string,
    title: string,
    description: string,
    data: Record<string, unknown> = {},
  ) => ({
    id,
    slug: id,
    title,
    description,
    data,
    status: "PUBLISHED",
    featured: true,
    sortOrder: 0,
    translations: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  db.sectors = [
    "Hospitality",
    "Healthcare",
    "Restaurant & Cafe",
    "Office",
    "Commercial",
    "Bespoke Contract Furniture",
  ].map((s, i) =>
    item(
      s.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      s,
      "Furniture developed around the way people inhabit a space. From early specification to final installation, our team translates your vision into considered, lasting pieces.",
      {
        image: images[i % 5],
        capabilities:
          "Design development · Prototyping · Bespoke production · Global delivery",
      },
    ),
  );
  db.productCategories = [
    "Chairs",
    "Armchairs",
    "Sofas",
    "Tables",
    "Coffee Tables",
    "Poufs",
    "Beds",
    "Headboards",
    "Cabinets",
    "Wardrobes",
    "Healthcare Furniture",
    "Office Furniture",
    "Custom Furniture",
  ].map((s) => item(s.toLowerCase().replaceAll(" ", "-"), s, ""));
  db.projectCategories = [
    "Hotel",
    "Restaurant",
    "Cafe",
    "Office",
    "Healthcare",
    "Retail",
    "Residential",
    "Commercial",
  ].map((s) => item(s.toLowerCase(), s, ""));
  db.projects = [
    "The Bosphorus Residence",
    "A quieter kind of hospitality",
    "Spaces for conversation",
    "A new perspective on work",
  ].map((s, i) => ({
    ...item(
      "sample-project-" + (i + 1),
      s,
      "Sample project — an illustrative concept, not a claim of completed work. A carefully balanced palette of natural oak, textured upholstery and precise metalwork brings warmth and continuity to this space.",
      {
        image: images[i],
        gallery: [images[(i + 1) % 5], images[(i + 2) % 5]],
        location: "Istanbul",
        country: "Türkiye",
        year: "2026",
        client: "Illustrative client",
        scope: "Fixed & loose furniture",
        specifications: "Natural oak · Bespoke upholstery · Custom metalwork",
      },
    ),
    categoryId: db.projectCategories[i].id,
    sectorId: db.sectors[i % 6].id,
  }));
  db.products = [
    "Arc lounge chair",
    "Linea dining table",
    "Forma sofa",
    "Noma cabinet",
    "Atelier headboard",
    "Contour armchair",
  ].map((s, i) => ({
    ...item(
      "sample-product-" + (i + 1),
      s,
      "Sample product — a considered expression of material and proportion. Developed for demanding contract interiors and tailored to the requirements of each project.",
      {
        ...catalogImages(catalogAssets[i].model),
        code: "HTY-" + (100 + i),
        body: "This illustrative furniture concept balances material character with the practical needs of a contract interior. Dimensions, upholstery, finishes and detailing can be developed around the project specification. Ask our team about design development, sampling and a coordinated furniture package.",
        dimensions: "Custom dimensions available",
        materials: "Oak, textile, steel",
        finishes: "Project-specific finishes",
      },
    ),
    categoryId: catalogAssets[i].category,
    sectorId: db.sectors[i % 6].id,
  }));
  db.pages = [
    item(
      "home",
      "Furniture for places\nthat matter.",
      "We bring spaces to life through considered furniture. From our home in Istanbul to projects around the world, we partner with architects, designers and developers to make their vision tangible.",
      {
        eyebrow: "CRAFTED IN ISTANBUL. MADE FOR THE WORLD.",
        heroVideo: "/videos/hty-story.mp4",
        heroVideoMode: "scroll",
        image: images[0],
        introTitle: "Your vision.\nOur craft.",
        selectedWorkTitle: "Made for the way\nwe live.",
        productTitle: "A language of\nform & material.",
        sectorTitle: "Different spaces.\nThe same attention.",
        manufacturingText:
          "Precision in production. Care in every connection. Fixed, loose and bespoke furniture, brought together by one manufacturing partner.",
        manufacturingImage: "/sample-workshop.webp",
        sampleNotice:
          "Illustrative sample portfolio and AI-generated imagery. Replace with verified HTY Global work before launch.",
        ctaTitle: "Let’s make something\nremarkable.",
        statistics: [
          ["01", "An integrated partner"],
          ["06", "Sectors we serve"],
          ["∞", "Bespoke possibilities"],
        ],
        manufacturingTitle: "The detail makes\nthe difference.",
      },
    ),
    item(
      "about",
      "A shared ambition.\nA considered approach.",
      "HTY Global is a contract furniture manufacturing partner based in Istanbul. We connect design intent with manufacturing expertise for international interiors.",
      {
        image: images[2],
        statistics: [
          ["03", "Furniture disciplines"],
          ["06", "Core sectors"],
          ["01", "Integrated manufacturing partner"],
        ],
        sections: [
          [
            "Our philosophy",
            "We believe furniture should serve its setting, endure daily use and carry the character of its materials.",
          ],
          [
            "International manufacturing",
            "From design development and prototypes to production and export coordination, we support every stage.",
          ],
          [
            "Contract expertise",
            "Fixed, loose and bespoke furniture for hospitality, workplaces, healthcare and commercial spaces.",
          ],
          [
            "Our values",
            "Precision. Open communication. Material integrity. Long-term partnership.",
          ],
          [
            "Markets & export",
            "Based in Türkiye, working with international project teams. Export arrangements are defined for every commission.",
          ],
        ],
      },
    ),
    item(
      "manufacturing",
      "From raw material\nto lasting detail.",
      "A complete manufacturing process, shaped around your project.",
      {
        image: "/sample-workshop.webp",
        gallery: ["/sample-workshop.webp", "/sample-chair.webp"],
        sections: [
          [
            "Wood production",
            "Material selection, panel preparation and joinery are coordinated around the approved specification. Natural timber and engineered boards are selected for their application, finish and performance requirements.",
          ],
          [
            "CNC machining",
            "Digital cutting and machining support repeatable components, precise connections and consistent detailing across project quantities. Manufacturing drawings guide the transition from design to production.",
          ],
          [
            "Upholstery",
            "Frames, foam, textiles and stitching are developed as one system. Comfort, durability and the visual direction of the interior inform every upholstery specification.",
          ],
          [
            "Metal works",
            "Custom frames, supports and details bring strength and precision to furniture assemblies. Fabrication and finish selections are coordinated with the broader material palette.",
          ],
          [
            "Painting & finishing",
            "Colour, texture and sheen are considered together. Finish samples help project teams review the final appearance before the specification progresses to production.",
          ],
          [
            "Assembly",
            "Components come together through controlled assembly sequences. Hardware, connections and fit are reviewed against approved drawings and reference samples.",
          ],
          [
            "Quality control",
            "Checks are planned around project requirements, from incoming materials to dimensions, finish consistency and final assembly. Issues are documented and addressed before release.",
          ],
          [
            "Packaging",
            "Protection is developed for each item and delivery route. Surface protection, identification and packing arrangements support careful handling through transport and installation.",
          ],
          [
            "Export logistics",
            "Packing lists, shipment planning and export documentation are coordinated with the project team and logistics partners. Delivery requirements are defined for each destination.",
          ],
          [
            "Custom production",
            "Project-specific dimensions, materials and details are developed around the brief. Fixed furniture, loose furniture and bespoke pieces can be coordinated as one package.",
          ],
          [
            "Prototyping",
            "Reference samples and prototypes make design decisions tangible. They allow teams to review proportion, comfort, materials and construction before committing to project production.",
          ],
        ],
      },
    ),
    item(
      "contact",
      "Start a conversation.",
      "Tell us about your next project.",
    ),
    item(
      "quote",
      "Your project.\nOur next conversation.",
      "Share your brief and our team will help define the next steps.",
    ),
  ];
  db.clients = [
    "Architects",
    "Interior designers",
    "Developers",
    "Hospitality teams",
  ].map((s, i) =>
    item("sample-client-" + i, s, "Illustrative partner category"),
  );
  db.blog = [
    item(
      "materials-and-meaning",
      "Materials with meaning",
      "Sample editorial — exploring how natural materials and thoughtful specification contribute to lasting interiors.",
      {
        image: images[1],
        body: "Good furniture starts with an understanding of its setting. Material selection, construction and finishing should be considered together, with durability and repairability in mind.",
      },
    ),
  ];
  db.settings = [
    item(
      "site",
      "HTY Global",
      "Contract furniture. Considered from every angle.",
      {
        email: "",
        phone: "",
        address: "Istanbul, Türkiye",
        whatsapp: "",
        linkedin: "",
        instagram: "",
        youtube: "",
        footer:
          "Fixed, loose and bespoke furniture for international projects.",
        seoTitle: "HTY Global — Contract Furniture",
        seoDescription:
          "Furniture manufacturing in Istanbul for hospitality, healthcare, workplaces and international contract projects.",
        logo: "",
        favicon: "",
        imageryNotice:
          "Illustrative sample content and AI-generated imagery. Replace with verified HTY Global materials before public launch.",
      },
    ),
  ];
  const pageTr: Record<string, [string, string]> = {
    home: [
      "Anlamlı mekânlar\niçin mobilya.",
      "Mekânlara özenle tasarlanmış mobilyalarla hayat veriyoruz. İstanbul’dan dünyanın farklı noktalarına, mimarlar, tasarımcılar ve proje geliştiricilerle birlikte çalışıyoruz.",
    ],
    about: [
      "Ortak bir vizyon.\nÖzenli bir yaklaşım.",
      "HTY Global, İstanbul merkezli bir sözleşmeli mobilya üretim ortağıdır. Tasarım vizyonunu uluslararası projeler için üretim uzmanlığıyla birleştiriyoruz.",
    ],
    manufacturing: [
      "Malzemeden\nkalıcı detaylara.",
      "Projenize göre şekillenen bütünleşik bir üretim süreci.",
    ],
    contact: [
      "Birlikte konuşalım.",
      "Yeni projeniz hakkında bize bilgi verin.",
    ],
    quote: [
      "Sizin projeniz.\nBir sonraki adımımız.",
      "Proje ihtiyaçlarınızı paylaşın; sonraki adımları birlikte belirleyelim.",
    ],
  };
  for (const page of db.pages) {
    const tr = pageTr[page.slug!];
    if (tr)
      page.translations = {
        tr: {
          title: tr[0],
          description: tr[1],
          ...(page.slug === "home"
            ? {
                data: {
                  introTitle: "Sizin vizyonunuz.\nBizim ustalığımız.",
                  selectedWorkTitle: "Yaşadığımız mekânlar\niçin üretildi.",
                  productTitle: "Form ve malzemenin\nortak dili.",
                  sectorTitle: "Farklı mekânlar.\nAynı özen.",
                  statistics: [
                    ["01", "Bütünleşik bir ortak"],
                    ["06", "Hizmet verdiğimiz sektörler"],
                    ["∞", "Özel üretim olanakları"],
                  ],
                  ctaTitle: "Birlikte fark yaratan\nmekânlar üretelim.",
                  manufacturingTitle: "Fark yaratan\ndetaylar.",
                },
              }
            : {}),
        },
      };
  }
  const categoryTr = [
    "Sandalyeler",
    "Tekli Koltuklar",
    "Kanepeler",
    "Masalar",
    "Sehpalar",
    "Puflar",
    "Yataklar",
    "Yatak Başlıkları",
    "Dolaplar",
    "Gardıroplar",
    "Sağlık Mobilyaları",
    "Ofis Mobilyaları",
    "Özel Mobilyalar",
  ];
  db.productCategories.forEach((entry, i) => {
    entry.translations = { tr: { title: categoryTr[i] } };
  });
  const projectCategoryTr = [
    "Otel",
    "Restoran",
    "Kafe",
    "Ofis",
    "Sağlık",
    "Perakende",
    "Konut",
    "Ticari",
  ];
  db.projectCategories.forEach((entry, i) => {
    entry.translations = { tr: { title: projectCategoryTr[i] } };
  });
  const sectorTr = [
    "Konaklama",
    "Sağlık",
    "Restoran & Kafe",
    "Ofis",
    "Ticari Mekânlar",
    "Özel Proje Mobilyaları",
  ];
  db.sectors.forEach((s, i) => {
    s.translations = {
      tr: {
        title: sectorTr[i],
        description:
          "Mekânın ihtiyaçlarına göre geliştirilen mobilyalar. İlk tasarımdan teslimata kadar projenizin her aşamasında yanınızdayız.",
      },
    };
  });
  for (const m of ["products", "projects"] as const)
    for (const entry of db[m])
      entry.translations = {
        tr: {
          description:
            "Örnek içerik — gerçek bir ürün veya tamamlanmış proje beyanı değildir. Doğal malzemeler, özenli işçilik ve projenize özel detaylarla şekillenen mobilya yaklaşımı.",
        },
      };
  return db;
}
