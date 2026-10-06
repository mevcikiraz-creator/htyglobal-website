"use server";
import { compare, hash } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { modules, type Module } from "@/lib/content";
import { list, get, save, remove } from "@/lib/store";
import { createSession, requireAdmin } from "@/lib/auth";
import { contentSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
export async function login(form: FormData) {
  const email = String(form.get("email") || "")
    .trim()
    .toLowerCase();
  const ip = (await headers()).get("x-forwarded-for") || "local";
  if (
    !(await rateLimit("login:" + ip, 20)) ||
    !(await rateLimit("login-email:" + email, 10))
  )
    redirect("/admin/login?error=rate");
  const u = (await list("users")).find((u) => u.email === email);
  if (
    !u ||
    !u.active ||
    !(await compare(String(form.get("password") || ""), String(u.passwordHash)))
  )
    redirect("/admin/login?error=credentials");
  await createSession({ id: u.id, tokenVersion: u.tokenVersion });
  redirect("/admin");
}
export async function logout() {
  (await cookies()).delete("hty-session");
  redirect("/admin/login");
}
export async function editContent(form: FormData) {
  const m = String(form.get("module")) as Module;
  await requireAdmin(m === "users" || m === "settings");
  if (!modules.includes(m)) throw new Error("Invalid module");
  const id = String(form.get("id") || randomUUID());
  const op = String(form.get("operation") || "save");
  const existing = await get(m, id);
  if (op === "delete") {
    if (m === "media") {
      for (const group of [
        "products",
        "projects",
        "pages",
        "sectors",
        "blog",
        "settings",
        "contacts",
        "quotes",
      ] as const)
        if (
          (await list(group)).some((x) => JSON.stringify(x.data).includes(id))
        )
          throw new Error("This media is still used by content or an inquiry");
    }
    if (m === "users") {
      const self = await requireAdmin(true);
      if (self.id === id) throw new Error("Cannot remove your own account");
    }
    await remove(m, id);
  } else if (op === "duplicate") {
    if (!existing || ["users", "media", "contacts", "quotes"].includes(m))
      throw new Error("Cannot duplicate");
    await save(m, {
      ...existing,
      id: randomUUID(),
      slug: existing.slug + "-" + randomUUID().slice(0, 8),
      title: existing.title + " (copy)",
      status: "DRAFT",
    });
  } else if (m === "media") {
    if (!existing) throw new Error("Missing media");
    await save(m, {
      ...existing,
      alt: String(form.get("alt") || "").slice(0, 300),
    });
  } else if (m === "users") {
    const email = String(form.get("email")).trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
      throw new Error("Invalid email");
    if ((await list("users")).some((u) => u.email === email && u.id !== id))
      throw new Error("Email already exists");
    const password = String(form.get("password") || "");
    if (
      (!existing || password) &&
      (password.length < 12 || Buffer.byteLength(password) > 72)
    )
      throw new Error("Use a password of at least 12 characters");
    const role = String(form.get("role"));
    if (!["ADMIN", "EDITOR"].includes(role)) throw new Error("Invalid role");
    const self = await requireAdmin(true);
    if (self.id === id && (role !== "ADMIN" || form.get("active") !== "on"))
      throw new Error("Cannot demote yourself");
    await save(m, {
      id,
      email,
      name: String(form.get("name")),
      role,
      active: form.get("active") === "on",
      passwordHash: password
        ? await hash(password, 12)
        : existing?.passwordHash,
      tokenVersion: Number(existing?.tokenVersion || 0) + 1,
    });
  } else if (["contacts", "quotes"].includes(m)) {
    if (!existing) throw new Error("Missing record");
    const status = String(form.get("status"));
    if (!["NEW", "IN_PROGRESS", "CLOSED"].includes(status))
      throw new Error("Invalid status");
    await save(m, { ...existing, status });
  } else {
    const content = contentSchema.parse({
      id,
      title: form.get("title"),
      slug: form.get("slug"),
      description: form.get("description"),
      status: form.get("status"),
      featured: form.get("featured") === "on",
      sortOrder: Number(form.get("sortOrder") || 0),
      data: JSON.parse(String(form.get("data") || "{}")),
      translations: JSON.parse(String(form.get("translations") || "{}")),
    });
    if ((await list(m)).some((x) => x.slug === content.slug && x.id !== id))
      throw new Error("Slug already exists");
    const relationships = ["products", "projects"].includes(m)
      ? {
          categoryId: String(form.get("categoryId") || "") || null,
          sectorId: String(form.get("sectorId") || "") || null,
        }
      : {};
    await save(m, { ...content, ...relationships });
  }
  revalidatePath("/", "layout");
  redirect("/admin/" + m);
}
