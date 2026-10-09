import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
const account = () =>
  JSON.parse(readFileSync(".data/test-account.json", "utf8"));
async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email", { exact: true }).fill(account().email);
  await page.getByLabel("Password", { exact: true }).fill(account().password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
test("public routes, localized content, portfolio filtering and mobile layout", async ({
  page,
  request,
}) => {
  for (const route of [
    "/",
    "/projects",
    "/products",
    "/sectors",
    "/about",
    "/manufacturing",
    "/contact",
    "/quote",
    "/news",
    "/projects/sample-project-1",
    "/products/sample-product-1",
    "/sectors/hospitality",
    "/tr",
    "/tr/contact",
    "/sitemap.xml",
    "/robots.txt",
  ]) {
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
  }
  for (const route of [
    "/about/not-a-real-page",
    "/projects/not-a-real-project",
  ])
    expect((await request.get(route)).status()).toBe(404);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Furniture for places",
  );
  const first = page.locator(".home-hero img");
  await expect(first).toBeVisible();
  expect(
    await first.evaluate((image) => (image as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await expect(page.locator(".category-links a")).toHaveCount(13);
  await page.goto("/about");
  await expect(page.locator(".stats>div")).toHaveCount(3);
  await page.goto("/manufacturing");
  await page
    .locator("main>.hero-picture img")
    .evaluate((img) => (img as HTMLImageElement).decode());
  expect(
    await page
      .locator("main>.hero-picture img")
      .evaluate((img) => (img as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
  await page.goto("/projects?category=hotel");
  await expect(page.locator(".work")).toHaveCount(1);
  await page.goto("/tr");
  await expect(page.locator("html")).toHaveAttribute("lang", "tr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Anlamlı",
  );
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.locator(".home-hero").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Toggle menu" }).click();
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("navigation")
    .getByRole("link", { name: "Products", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products$/);
});
test("admin routes and upload API are protected", async ({ page, request }) => {
  for (const route of [
    "/admin",
    "/admin/products",
    "/admin/users",
    "/admin/products/new",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login/);
  }
  expect((await request.post("/api/media")).status()).toBe(401);
  const invalid = await request.post("/api/inquiries", {
    multipart: { name: "A", email: "invalid", message: "short" },
  });
  expect(invalid.status()).toBe(400);
});
test("authenticated product CRUD, publication and duplication", async ({
  page,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await login(page);
  await page.goto("/admin/products/new");
  const suffix = Date.now();
  const slug = "test-product-" + suffix;
  await page
    .getByLabel("Title", { exact: true })
    .fill("Test product " + suffix);
  await page.getByLabel("URL slug").fill(slug);
  await page
    .getByLabel("Description", { exact: true })
    .fill("A test entry for a real content workflow.");
  await page.getByLabel("Publication").selectOption("PUBLISHED");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
  await page.goto("/products/" + slug);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Test product",
  );
  await page.goto("/admin/products");
  const row = page
    .getByRole("row")
    .filter({ hasText: "Test product " + suffix });
  await row.getByRole("link", { name: "Manage" }).click();
  await page.getByRole("button", { name: "Duplicate as draft" }).click();
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Test product " + suffix + " (copy)" }),
  ).toContainText("DRAFT");
  await page
    .getByRole("row")
    .filter({ hasText: "Test product " + suffix + " (copy)" })
    .getByRole("link", { name: "Manage" })
    .click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Test product " + suffix })
    .getByRole("link", { name: "Manage" })
    .click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "Test product " + suffix }),
  ).toHaveCount(0);
  await page.goto("/products/" + slug);
  await expect(
    page.getByRole("heading", { name: "Page not found." }),
  ).toBeVisible();
});
test("contact and RFQ forms persist, attachments stay private", async ({
  page,
  request,
}) => {
  const stamp = Date.now();
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Test inquiry " + stamp);
  await page.getByLabel("Email", { exact: true }).fill("test@example.invalid");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Please provide furniture information for our new hotel project.");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("received");
  await page.goto("/quote");
  await page.getByLabel("Name", { exact: true }).fill("Test quote " + stamp);
  await page.getByLabel("Email", { exact: true }).fill("test@example.invalid");
  await page
    .getByLabel("Message", { exact: true })
    .fill("A request for bespoke furniture with attached specifications.");
  await page.locator("input[type=file]").setInputFiles({
    name: "brief.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4\n% Test specification\n%%EOF"),
  });
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("received");
  page.on("dialog", (dialog) => dialog.accept());
  await login(page);
  await page.goto("/admin/contacts");
  await page
    .getByRole("row")
    .filter({ hasText: "Test inquiry " + stamp })
    .getByRole("link", { name: "Manage" })
    .click();
  await expect(page.locator(".notice")).toContainText("new hotel project");
  await page.getByLabel("Status").selectOption("CLOSED");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "Test inquiry " + stamp })
    .getByRole("link", { name: "Manage" })
    .click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await page.goto("/admin/quotes");
  await page
    .getByRole("row")
    .filter({ hasText: "Test quote " + stamp })
    .getByRole("link", { name: "Manage" })
    .click();
  const href = await page
    .getByRole("link", { name: "Download attachment" })
    .getAttribute("href");
  expect(href).toBeTruthy();
  expect((await request.get(href!)).status()).toBe(401);
  expect((await page.request.get(href!)).status()).toBe(200);
  await page.getByRole("button", { name: "Delete permanently" }).click();
});

test("media images and PDF specifications upload, reuse, edit and delete", async ({
  page,
  request,
}) => {
  page.on("dialog", (dialog) => dialog.accept());
  await login(page);
  const sharp = (await import("sharp")).default;
  const image = await sharp({
    create: { width: 20, height: 20, channels: 3, background: "#decdb4" },
  })
    .png()
    .toBuffer();
  const response = await page.request.post("/api/media", {
    headers: { origin: "http://localhost:3000" },
    multipart: {
      file: { name: "test-image.png", mimeType: "image/png", buffer: image },
    },
  });
  expect(response.status()).toBe(200);
  const media = await response.json();
  const publicImage = await request.get(media.url);
  expect(publicImage.status()).toBe(200);
  expect(publicImage.headers()["content-type"]).toBe("image/webp");
  await page.goto("/admin/media/" + media.id);
  await page
    .getByLabel("Alternative text")
    .fill("A test image with accessible alternative text");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page).toHaveURL(/\/admin\/media$/);
  await page.goto("/admin/media/" + media.id);
  await expect(page.getByLabel("Alternative text")).toHaveValue(
    "A test image with accessible alternative text",
  );
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page).toHaveURL(/\/admin\/media$/);
  expect((await request.get(media.url)).status()).toBe(404);
  const spec = await page.request.post("/api/media", {
    headers: { origin: "http://localhost:3000" },
    multipart: {
      file: {
        name: "test-spec.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4\n% Spec\n%%EOF"),
      },
    },
  });
  expect(spec.status()).toBe(200);
  const pdf = await spec.json();
  const download = await request.get(pdf.url);
  expect(download.status()).toBe(200);
  expect(download.headers()["content-disposition"]).toContain("attachment");
  await page.goto("/admin/media/" + pdf.id);
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page).toHaveURL(/\/admin\/media$/);
  expect((await request.get(pdf.url)).status()).toBe(404);
  const invalid = await page.request.post("/api/media", {
    headers: { origin: "http://localhost:3000" },
    multipart: {
      file: {
        name: "script.html",
        mimeType: "text/html",
        buffer: Buffer.from("<script>alert(1)</script>"),
      },
    },
  });
  expect(invalid.status()).toBe(400);
});

test("collection search, wood previews and selected-product RFQ persist", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  await page.goto("/products");
  await expect(page.locator(".catalog-categories a")).toHaveCount(14);
  await expect(page.locator(".product-card")).toHaveCount(6);
  await page.getByRole("textbox", { name: "Search products" }).fill("Linea");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card")).toContainText("Linea");
  await page.goto("/products?category=chairs");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await expect(page.locator(".product-card")).toContainText("Contour");
  for (const model of ["arc", "linea", "forma", "noma", "atelier", "contour"])
    for (const wood of ["beech", "walnut", "oak", "ash"])
      expect(
        (await request.get(`/products/${model}-${wood}.webp`)).status(),
      ).toBe(200);
  await page.goto("/products/sample-product-1");
  for (const [label, wood] of [
    ["Beech", "beech"],
    ["Walnut", "walnut"],
    ["Oak", "oak"],
    ["Ash", "ash"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page.locator(".product-stage")).toHaveAttribute(
      "data-wood",
      wood,
    );
    await expect(page.locator(".product-stage img")).toHaveAttribute(
      "alt",
      `Arc lounge chair — ${label}`,
    );
    await page
      .locator(".product-stage img")
      .evaluate((img) => (img as HTMLImageElement).decode());
    expect(
      await page
        .locator(".product-stage img")
        .evaluate((img) => (img as HTMLImageElement).currentSrc),
    ).toContain(encodeURIComponent(`/products/arc-${wood}.webp`));
  }
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.getByRole("button", { name: "Walnut", exact: true }).click();
  await page
    .getByRole("link", { name: "Request a quote", exact: true })
    .click();
  await expect(page).toHaveURL(/product=sample-product-1.*wood=walnut/);
  await expect(page.locator(".quote-product-summary")).toContainText("Walnut");
  const name = "Test wood quote " + Date.now();
  await page.getByLabel("Name", { exact: true }).fill(name);
  await page.getByLabel("Email", { exact: true }).fill("test@example.invalid");
  await page
    .getByLabel("Message", { exact: true })
    .fill("Please quote the selected wooden furniture for our hotel project.");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByRole("status")).toContainText("received");
  await login(page);
  await page.goto("/admin/quotes");
  await page
    .getByRole("row")
    .filter({ hasText: name })
    .getByRole("link", { name: "Manage" })
    .click();
  await expect(page.locator(".notice")).toContainText("Arc lounge chair");
  await expect(page.locator(".notice")).toContainText("walnut");
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await page.goto("/tr/products/sample-product-1");
  await page.getByRole("button", { name: "Ceviz ağacı", exact: true }).click();
  await expect(page.locator(".wood-selection")).toContainText("Ceviz ağacı");
});
test("home film follows scroll, seeks backwards and respects reduced motion", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const range = await request.get("/videos/hty-story.mp4", {
    headers: { Range: "bytes=0-1023" },
  });
  expect(range.status()).toBe(206);
  await page.goto("/");
  await expect(page.locator(".hero-video")).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator(".hero-video")
        .evaluate((video) => (video as HTMLVideoElement).duration),
    )
    .toBeGreaterThan(10);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.8));
  await expect
    .poll(() =>
      page
        .locator(".hero-video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeGreaterThan(2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect
    .poll(() =>
      page
        .locator(".hero-video")
        .evaluate((video) => (video as HTMLVideoElement).currentTime),
    )
    .toBeLessThan(0.2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".hero-video")).toHaveCount(0);
  await expect(page.locator(".film-poster")).toBeVisible();
});
