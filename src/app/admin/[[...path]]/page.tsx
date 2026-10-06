import Arrow from "@/components/arrow";
import DeleteButton from "@/components/delete-button";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { randomUUID } from "node:crypto";
import { session } from "@/lib/auth";
import { list, get } from "@/lib/store";
import { modules, type Module } from "@/lib/content";
import { editContent, logout } from "../actions";
import ContentEditor from "@/components/content-editor";
import { MediaUpload } from "@/components/forms";
export const dynamic = "force-dynamic";
const labels: Record<Module, string> = {
  products: "Products",
  productCategories: "Product categories",
  projects: "Projects",
  projectCategories: "Project categories",
  sectors: "Sectors",
  pages: "Pages / Homepage",
  clients: "Clients / References",
  blog: "Blog / News",
  contacts: "Contact messages",
  quotes: "Quote requests",
  media: "Media library",
  settings: "Site settings / SEO",
  users: "Users",
};
export default async function Admin({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const user = await session();
  if (!user) redirect("/admin/login");
  const { path = [] } = await params;
  const m = path[0] as Module;
  if ((m && !modules.includes(m)) || path.length > 2) notFound();
  if (["users", "settings"].includes(m) && user.role !== "ADMIN") notFound();
  const rows = m ? await list(m) : [];
  const editing = Boolean(path[1]);
  const entry = editing
    ? path[1] === "new"
      ? {
          id: randomUUID(),
          title: "",
          slug: "",
          description: "",
          status: "DRAFT",
          data: {},
          translations: {},
          featured: false,
          sortOrder: 0,
        }
      : await get(m, path[1])
    : undefined;
  if (editing && !entry) notFound();
  const cats =
    m === "products"
      ? await list("productCategories")
      : m === "projects"
        ? await list("projectCategories")
        : [];
  const sectors = ["products", "projects"].includes(m)
    ? await list("sectors")
    : [];
  const stats = !m
    ? await Promise.all(
        ["products", "projects", "quotes", "contacts"].map((x) =>
          list(x as Module),
        ),
      )
    : [];
  const totalDrafts = !m
    ? (
        await Promise.all(
          [
            "products",
            "projects",
            "pages",
            "sectors",
            "clients",
            "blog",
            "productCategories",
            "projectCategories",
          ].map((x) => list(x as Module)),
        )
      )
        .flat()
        .filter((x) => x.status === "DRAFT").length
    : 0;
  const recent = !m
    ? (
        await Promise.all(
          ["products", "projects", "pages", "blog"].map(async (module) =>
            (await list(module as Module)).map((x) => ({ ...x, module })),
          ),
        )
      )
        .flat()
        .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
        .slice(0, 8)
    : [];
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="brand" href="/admin">
          HTY GLOBAL<small>CONTENT STUDIO</small>
        </Link>
        <nav>
          <Link href="/admin">Overview</Link>
          {modules
            .filter(
              (x) =>
                user.role === "ADMIN" || !["users", "settings"].includes(x),
            )
            .map((x) => (
              <Link key={x} href={"/admin/" + x}>
                {labels[x]}
              </Link>
            ))}
        </nav>
      </aside>
      <main className="admin-main">
        <div className="admin-top">
          <Link href="/">
            <Arrow direction="left" /> View website
          </Link>
          <span className="muted">
            {String(user.name)} · {String(user.role)}
          </span>
          <form action={logout}>
            <button>Sign out</button>
          </form>
        </div>
        <h1>{m ? labels[m] : "Your website, at a glance."}</h1>
        {!m ? (
          <>
            <div className="dashboard-stats">
              {["products", "projects", "quotes", "contacts"].map((x, i) => (
                <Link href={"/admin/" + x} key={x}>
                  <strong>{stats[i].length}</strong>
                  {labels[x as Module]}
                </Link>
              ))}
              <Link href="/admin/products">
                <strong>{totalDrafts}</strong>
                Content drafts
              </Link>
            </div>
            <h2>Recently updated</h2>
            <table className="admin-table">
              <tbody>
                {recent.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <Link href={`/admin/${x.module}/${x.id}`}>{x.title}</Link>
                    </td>
                    <td>{x.status}</td>
                    <td>{String(x.updatedAt || "").slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="notice">
              Sample content is illustrative. Replace it with verified company
              details and licensed project photography before launch. English is
              the default; add Turkish translations in each content record.
            </div>
          </>
        ) : editing && entry ? (
          <form action={editContent} className="admin-form">
            <input type="hidden" name="module" value={m} />
            <input type="hidden" name="id" value={entry.id} />
            {m === "media" ? (
              <>
                <p>Reusable URL: /api/media/{entry.id}</p>
                <label>
                  Alternative text
                  <input
                    name="alt"
                    defaultValue={String(entry.alt || "")}
                    maxLength={300}
                  />
                </label>
                <p>
                  {entry.private
                    ? "Private inquiry attachment"
                    : "Public website image"}
                </p>
              </>
            ) : m === "users" ? (
              <>
                <label>
                  Name
                  <input
                    name="name"
                    defaultValue={String(entry.name || "")}
                    required
                  />
                </label>
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    defaultValue={String(entry.email || "")}
                    required
                  />
                </label>
                <label>
                  Role
                  <select
                    name="role"
                    defaultValue={String(entry.role || "EDITOR")}
                  >
                    <option>EDITOR</option>
                    <option>ADMIN</option>
                  </select>
                </label>
                <label>
                  <input
                    name="active"
                    type="checkbox"
                    defaultChecked={entry.active !== false}
                  />
                  Active account
                </label>
                <label>
                  {entry.email
                    ? "New password (leave blank to keep current)"
                    : "Password (12+ characters)"}
                  <input
                    name="password"
                    type="password"
                    minLength={12}
                    autoComplete="new-password"
                    required={!entry.email}
                  />
                </label>
              </>
            ) : ["contacts", "quotes"].includes(m) ? (
              <>
                <div className="notice">
                  {[
                    "name",
                    "company",
                    "email",
                    "phone",
                    "country",
                    "subject",
                    "message",
                  ].map((k) => (
                    <p key={k}>
                      <strong>{k}: </strong>
                      {String(entry[k] || "")}
                    </p>
                  ))}
                  {Object.entries(entry.data || {})
                    .filter(([k]) => k !== "attachments")
                    .map(([k, v]) => (
                      <p key={k}>
                        {k}: {String(v)}
                      </p>
                    ))}
                  {Array.isArray(entry.data?.attachments) &&
                    entry.data.attachments.map((id, i) => (
                      <p key={String(id)}>
                        <a href={"/api/media/" + id}>
                          Download attachment {i + 1} <Arrow />
                        </a>
                      </p>
                    ))}
                </div>
                <label>
                  Status
                  <select name="status" defaultValue={entry.status}>
                    <option>NEW</option>
                    <option>IN_PROGRESS</option>
                    <option>CLOSED</option>
                  </select>
                </label>
              </>
            ) : (
              <>
                <div className="form-grid">
                  <label>
                    Title
                    {m === "pages" ? (
                      <textarea
                        name="title"
                        rows={2}
                        defaultValue={entry.title}
                        required
                      />
                    ) : (
                      <input name="title" defaultValue={entry.title} required />
                    )}
                  </label>
                  <label>
                    URL slug
                    <input
                      name="slug"
                      defaultValue={entry.slug}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                      required
                    />
                  </label>
                </div>
                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={entry.description}
                    rows={5}
                  />
                </label>
                <div className="form-grid">
                  <label>
                    Publication
                    <select name="status" defaultValue={entry.status}>
                      <option>DRAFT</option>
                      <option>PUBLISHED</option>
                    </select>
                  </label>
                  <label>
                    Sort order
                    <input
                      name="sortOrder"
                      type="number"
                      min={0}
                      defaultValue={Number(entry.sortOrder || 0)}
                    />
                  </label>
                </div>
                <label>
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={entry.featured}
                  />
                  Featured
                </label>
                {cats.length > 0 && (
                  <div className="form-grid">
                    <label>
                      Category
                      <select
                        name="categoryId"
                        defaultValue={String(entry.categoryId || "")}
                      >
                        <option value="">None</option>
                        {cats.map((c) => (
                          <option value={c.id} key={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Sector
                      <select
                        name="sectorId"
                        defaultValue={String(entry.sectorId || "")}
                      >
                        <option value="">None</option>
                        {sectors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
                <div className="notice">
                  Content fields are structured JSON. Image URLs can be copied
                  from Media Library. Use image, imageAlt, gallery (ordered URL
                  array), code, dimensions, materials, finishes, pdf, location,
                  country, year, client, scope, specifications, video, seoTitle
                  and seoDescription as appropriate. Homepage fields and site
                  settings are pre-populated with editable examples.
                </div>
                <ContentEditor
                  initial={entry.data || {}}
                  kind={m === "pages" ? String(entry.slug) : m}
                />
                <label>
                  Translations (language codes: en, tr, future ar)
                  <textarea
                    name="translations"
                    rows={8}
                    defaultValue={JSON.stringify(
                      entry.translations || {},
                      null,
                      2,
                    )}
                  />
                </label>
                <small>
                  Example:{" "}
                  {`{"tr":{"title":"Başlık","description":"Açıklama"}}`}.
                  Missing translations fall back to English.
                </small>
              </>
            )}
            <div className="admin-actions">
              <button name="operation" value="save" className="button dark">
                Save changes
              </button>
              {!["users", "contacts", "quotes", "media"].includes(m) &&
                path[1] !== "new" && (
                  <button
                    name="operation"
                    value="duplicate"
                    formNoValidate
                    className="button"
                  >
                    Duplicate as draft
                  </button>
                )}
              {path[1] !== "new" && <DeleteButton />}
              <Link href={"/admin/" + m} className="button">
                Cancel
              </Link>
            </div>
          </form>
        ) : (
          <>
            {m === "media" ? (
              <>
                <MediaUpload />
                <div className="notice">
                  Use the reusable URL in an image or gallery field. Inquiry
                  attachments are private. Public images are decoded and
                  converted to WebP on upload.
                </div>
              </>
            ) : (
              !["contacts", "quotes"].includes(m) && (
                <Link className="button dark" href={`/admin/${m}/new`}>
                  Create {labels[m]} +
                </Link>
              )
            )}
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title / Name</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id}>
                    <td>
                      {String(
                        x.title || x.name || x.filename || x.email || x.id,
                      )}
                    </td>
                    <td>{String(x.status || (x.private ? "Private" : "—"))}</td>
                    <td>
                      {String(x.updatedAt || x.createdAt || "").slice(0, 10)}
                    </td>
                    <td>
                      {m === "media" ? (
                        <>
                          <a href={"/api/media/" + x.id}>
                            {x.private ? "Download" : "View"}
                          </a>{" "}
                          · <Link href={"/admin/media/" + x.id}>Manage</Link>
                        </>
                      ) : (
                        <Link href={`/admin/${m}/${x.id}`}>
                          Manage <Arrow />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length && <p className="notice">No entries yet.</p>}
          </>
        )}
      </main>
    </div>
  );
}
