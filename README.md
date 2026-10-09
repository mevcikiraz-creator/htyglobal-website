# HTY Global — website & content studio

An original editorial corporate website and working custom CMS for contract furniture manufacturing. The repository started empty. Content and AI-generated illustrations are **samples**, not verified company history, products, completed projects or client endorsements. Replace them before public launch. No material from Bloomint was copied; its site was inaccessible from the initial cloud network policy.

## Architecture

- Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4 with a bespoke editorial stylesheet.
- Server-rendered public content, Next/Image, responsive navigation, restrained motion and reduced-motion support.
- PostgreSQL with Prisma 7 and its official JavaScript PostgreSQL adapter. Version-pinned official Prisma WASM/generator packages support schema generation and migrations without fetching native binaries. npm lockfile integrity and TLS verification stay enabled. These APIs are internal upstream packages: keep their versions aligned and run the checks when upgrading. Node **24** is required; schema-engine WASM currently produces a Node experimental-module warning.
- Database-backed admin sessions: bcrypt password hashes, signed eight-hour JWT cookies (`HttpOnly`, `SameSite=Strict`, `Secure` in production), user activation, ADMIN/EDITOR roles and token-version revocation after account edits. Every admin page and server mutation checks the current database user. Next server actions enforce origin checks; upload/form endpoints validate origins explicitly.
- Real server actions provide CMS CRUD, draft/publication, featured flags, category/sector assignments, duplication, ordering, gallery uploading/reordering, specifications and SEO.
- Contact and RFQ forms validate input, bound request sizes even without Content-Length, apply PostgreSQL-backed rate limits, persist submissions and restrict attachment download to authenticated staff.
- Uploaded images are decoded, dimension-limited, stripped of metadata and converted to WebP. Executable/SVG/HTML uploads are rejected. Inquiry documents are private and served as attachments with `nosniff`.
- `src/lib/storage.ts` exposes a small storage interface. The provided local adapter requires a persistent private volume. An S3-compatible adapter can implement the same `put`/`read` contract without changing forms or CMS. Production files do not belong in Git.
- With no `DATABASE_URL`, **development only** uses an atomic, serialized single-process JSON store under `.data`. Production refuses this fallback unless explicitly opted into for a disposable test. This is not a production database substitute.

## Install

```bash
npm ci --cache /tmp/hty-npm
cp .env.example .env
npm run db:generate
```

Set environment values securely; do not commit `.env`, credentials, `.data`, database dumps or uploads. Next automatically loads `.env`. CLI scripts use dotenv.

| Variable                        | Purpose                                                                                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                  | PostgreSQL connection URL, including deployment-required TLS parameters                                     |
| `AUTH_SECRET`                   | Random secret of at least 32 characters, required in production                                             |
| `SITE_URL`                      | Real public HTTPS origin for canonical URLs, sitemap and structured data                                    |
| `DATA_DIR`                      | Private writable persistent directory for uploads; defaults to `.data`                                      |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Secure shell values used only by `npm run admin:create`; password 12+ characters and at most 72 UTF-8 bytes |
| `POSTGRES_PASSWORD`             | Required by the optional local Docker Compose database                                                      |
| `CHROMIUM_PATH`                 | Optional Playwright browser path; default `/usr/bin/chromium`                                               |

Generate a secret without displaying it in shared logs, and provide it through your host's secure environment settings. There is **no default admin password**. The local onboarding instance uses a loopback-only disposable PostgreSQL Docker container; do not reuse its authentication policy in deployment.

## Database and seed

For a local PostgreSQL instance, set `POSTGRES_PASSWORD` securely in your shell and use:

```bash
docker compose up -d db
# Configure DATABASE_URL for the hty database and hty user on 127.0.0.1:5432.
npm run db:migrate
npm run seed
npm run db:validate
```

`db:migrate` applies checked-in SQL with Prisma's official migration engine WASM and records history in `_prisma_migrations`. Re-running it does not repeat applied migrations. The initial SQL was generated from the Prisma schema; the second migration adds persistent rate limits. Standard `npx prisma migrate deploy` also works when the official native engine download domain is accessible. For future schema changes, use standard Prisma migration generation against a development/shadow database, review the generated SQL and check it in. Never reset a production database.

Seed data contains 6 products, 4 projects, 13 product categories, 8 project categories, 6 sectors, homepage/about/manufacturing/contact/RFQ pages, 4 illustrative reference categories, one editorial and site settings. Seeding skips modules that already have content and never creates an administrator. Creating translations and image sample updates during onboarding used narrowly scoped helper scripts under `scripts/`; these are not needed for fresh seeds.

Models: User, Product, ProductCategory, ProductImage, Project, ProjectCategory, ProjectImage, Sector, Page, Client, BlogPost, ContactSubmission, QuoteRequest, Media, SiteSetting, RateLimit. Foreign keys, publication status, timestamps, unique slugs and relevant indexes are defined in `prisma/schema.prisma`. The CMS gallery stores ordered reusable URLs in the content JSON; normalized image tables are available for future reporting/import integrations. RFQ project fields and attachment IDs are stored in structured JSON.

## Administrator setup and running

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` through secure shell environment injection, then:

```bash
npm run admin:create
npm run dev
```

Open `/admin/login` and use the account you created. Remove bootstrap variables from the runtime after creation. ADMIN users can manage users/settings; EDITOR users manage content and inquiries. Accounts can be deactivated. Users cannot demote, deactivate or delete their own current account.

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run start
```

`build` uses webpack for predictable cloud builds. Set all production environment values before starting. Use HTTPS through a trusted reverse proxy. There is no deployment performed by this repository setup.

## Routes

Public: `/`, `/projects`, `/projects/[slug]`, `/products`, `/products/[slug]`, `/sectors`, `/sectors/[slug]`, `/about`, `/manufacturing`, `/contact`, `/quote`, `/news`, `/news/[slug]`. English is default; `/tr` prefixes Turkish equivalents. Unpublished entries are never returned by public queries. Unknown routes return 404. Metadata, canonical and alternate language URLs, OpenGraph/Twitter, JSON-LD, sitemap and robots are provided. Sitemap is generated dynamically from published records.

Admin: `/admin`, `/admin/login`, `/admin/[module]`, `/admin/[module]/new`, `/admin/[module]/[id]`. Modules cover products/categories, projects/categories, sectors, pages/homepage, clients, blog/news, contacts, RFQs, media, SEO/site settings and users.

API: `/api/inquiries` (POST), `/api/media` (authenticated POST), `/api/media/[id]` (public images or protected attachments).

## Editing content

Products/projects have dedicated fields for images, gallery, dimensions, materials, finishes, project details and SEO. Upload multiple gallery images, reorder with arrows and select a cover. The Media Library accepts images and public PDF specifications and provides reusable URLs and alt-text editing. Deleting a referenced media record is refused. Deleting an unreferenced media record does not automatically purge its file; schedule storage cleanup after a backup-retention period.

Pages, homepage and settings support common field controls plus an advanced structured JSON editor. Homepage data controls hero image/statement, introduction, section titles, selected items through their featured flags, statistics, manufacturing teaser and CTA. Clients control reference text/logos; settings control footer, contact/social details, brand/logo/favicon and default SEO. More complex page `sections` and homepage `statistics` are ordered arrays editable in JSON. This is a functional content editor, but not a drag-and-drop page builder or rich-text editor.

### Product collection, wood previews and the homepage film

The collection retains all 13 existing product categories, adds a category sidebar, search, sorting, responsive product cards and a dedicated product detail view. The right-hand customization panel offers Beech, Walnut, Oak and Ash. Each option uses a separate prepared image of the same product; it does not apply a colour filter to the entire photo. The six original sample products have 24 original AI-generated material previews. These are illustrative finish concepts, not calibrated photography or a live 3D model.

CMS product fields: `woodBeechImage`, `woodWalnutImage`, `woodOakImage`, `woodAshImage` and `defaultWood`. Add corresponding views for each actual product. Missing options are disabled. Keep non-wood parts and the camera angle consistent when preparing replacement images. Main-view selection resets gallery view; other gallery photographs retain their own finishes. A product-specific quote link carries the product slug and wood choice into the RFQ; the server validates the selection and stores a canonical product snapshot and wood ID.

Homepage fields: `heroVideo` (MP4 URL) and `heroVideoMode` (`scroll` or `loop`). An empty `heroVideo` uses the poster only. Scroll mode pins the film while page movement advances/reverses playback; reduced-motion mode uses a static poster. A pause/play control is supplied. The checked-in 13-second film is an original demonstration made with pans/transitions over our generated sample imagery. It is **not footage from Perkins&Will**. External or replaced MP4 files must support byte-range requests for seeking; keep a fast-start MP4 and frequent keyframes. The existing media uploader accepts images/PDF, not video: use a hosted video URL or commit an authorized, optimized demo asset.

Vercel production builds run `content:release` after explicit bootstrap and before the Next build. This one-time-by-record update only refreshes untouched original demo images/category assignments and adds a film URL when the homepage has no video field. Deleted products, renamed/uploaded products, existing wood-preview fields, custom copy, galleries, chosen categories and existing films are preserved. It never writes user accounts. For local onboarding verification, `VERCEL_ENV=production npm run content:release` applies it to the configured **local** database.

Paged, Laskasas and Perkins&Will were requested as references but blocked by the environment network filter. No products or video were downloaded from them. See [ASSET_SOURCES.md](./ASSET_SOURCES.md) for the asset provenance and replacement notes.

Translations are JSON keyed by locale, e.g.:

```json
{
  "tr": {
    "title": "Türkçe başlık",
    "description": "Türkçe açıklama",
    "data": { "introTitle": "Sizin vizyonunuz" }
  }
}
```

Turkish navigation, primary homepage/page/sector copy and sample descriptions are supplied; missing translations fall back to English. Some secondary editorial/form helper copy remains English. Add `ar` records without database restructuring; enabling its route/UI and RTL styles is a later localization step. CMS text is rendered as plain text to avoid arbitrary HTML execution.

## Validation

Fifteen unit tests exercise invalid/valid form inputs, slug/publication validation, streamed body size limits, configured-origin checks, concurrent development-store persistence, and deployment setup guards (explicit opt-in, production-only execution, required connection, failure handling, direct migration connections and first-administrator credential guards, safe sample-content release and supported wood selections). Seven browser tests exercise public/detail routes, filtering, Turkish locale, rendered optimized images, three viewport sizes, mobile navigation, admin protection, product create/publish/duplicate/delete, contact/RFQ persistence, private attachment access, media/PDF upload/edit/delete, collection search, four material previews and RFQ selection persistence, video byte ranges, scroll seeking in both directions and reduced-motion behavior.

With the app running locally:

```bash
npm run test:prepare
npm run test:e2e
npm run test:cleanup
```

The test account is random and written only to ignored `.data/test-account.json`; cleanup removes it. E2E uses a real database and mutates temporary content. Run it against a disposable test database, never production. Browser screenshots/traces are ignored outputs in `test-results`.

## Vercel

For GitHub import, environment variables and the current serverless upload limitations, see [VERCEL.md](./VERCEL.md). The build command generates the ignored Prisma client before compiling; database setup is an explicitly enabled first-deployment step (`HTY_SETUP_DATABASE=true` on Vercel production only), or a manual release step. See VERCEL.md; remove the bootstrap flag after initialization.

## Deployment and remaining configuration

Provide a managed PostgreSQL database, `AUTH_SECRET`, real `SITE_URL`, a persistent private upload volume (or implement the storage interface for S3/Cloudinary), backups and HTTPS. Run migrations before starting the new version. Build-time Prisma tooling currently needs devDependencies; do not omit them before generating/building. Keep process secrets in your host's secret manager.

Configure trusted reverse proxies to overwrite client-supplied forwarding headers, enforce upload/rate limits at the edge and add malware scanning/quarantine for third-party RFQ archives according to your deployment policy. Schedule expiration cleanup of the RateLimit table and storage retention. Optional notification emails, external map embedding, analytics, advanced rich text, drag-and-drop page building, MFA and an audit log are not integrated. No email-provider credentials are required for the implemented database inbox.

Before public launch, replace all samples and generated imagery, supply company address/email/phone and authorized client references, complete Turkish editorial translations, verify privacy/retention notices with the company's policy, test backups/restores, and perform deployment-specific accessibility/performance and security review. The implementation and local tests are a working foundation; they do not certify Core Web Vitals, production hosting or external integrations.
