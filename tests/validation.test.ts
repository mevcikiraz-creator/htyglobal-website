import { test } from "node:test";
import assert from "node:assert/strict";
import { inquirySchema, contentSchema } from "../src/lib/validation";
import { boundedFormData } from "../src/lib/request";
test("inquiry requires a valid email, name and substantive message", () => {
  assert.equal(
    inquirySchema.safeParse({ name: "A", email: "bad", message: "short" })
      .success,
    false,
  );
  assert.equal(
    inquirySchema.safeParse({
      name: "Test Person",
      email: "test@example.com",
      message: "A project requiring contract furniture.",
    }).success,
    true,
  );
});
test("CMS rejects invalid publication status and unsafe slugs", () => {
  const entry = {
    id: "test",
    title: "Title",
    slug: "../admin",
    description: "",
    status: "PUBLISHED",
    featured: false,
    sortOrder: 0,
    data: {},
    translations: {},
  };
  assert.equal(contentSchema.safeParse(entry).success, false);
  assert.equal(
    contentSchema.safeParse({ ...entry, slug: "valid-slug", status: "UNKNOWN" })
      .success,
    false,
  );
  assert.equal(
    contentSchema.safeParse({ ...entry, slug: "valid-slug" }).success,
    true,
  );
});
test("body size enforcement also works without content-length", async () => {
  const req = new Request("http://localhost", {
    method: "POST",
    body: "x".repeat(200),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
  await assert.rejects(boundedFormData(req, 100), /too large/);
});

test("origin checks use the configured public URL behind a reverse proxy", async () => {
  const { sameOrigin } = await import("../src/lib/request");
  const previous = process.env.SITE_URL;
  process.env.SITE_URL = "https://example.com";
  try {
    assert.equal(
      sameOrigin(
        new Request("http://internal:3000", {
          headers: { origin: "https://example.com" },
        }),
        true,
      ),
      true,
    );
    assert.equal(
      sameOrigin(
        new Request("http://internal:3000", {
          headers: { origin: "https://attacker.example" },
        }),
        true,
      ),
      false,
    );
    assert.equal(sameOrigin(new Request("http://internal:3000"), true), false);
  } finally {
    if (previous === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = previous;
  }
});

test("inquiries reject unsupported wood selections", () => {
  assert.equal(
    inquirySchema.safeParse({
      name: "Example buyer",
      email: "buyer@example.invalid",
      message: "Please quote furniture for our project.",
      woodType: "unsupported-wood",
    }).success,
    false,
  );
});
