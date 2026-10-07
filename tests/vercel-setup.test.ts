import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const { setup } = createRequire(import.meta.url)(
  "../scripts/vercel-setup.cjs",
) as {
  setup: (
    env: Record<string, string>,
    run: (script: string, env: Record<string, string>) => void,
  ) => void;
};
test("database setup is opt-in and never runs for preview deployments", () => {
  let calls = 0;
  const run = () => calls++;
  setup(
    { VERCEL_ENV: "production", DATABASE_URL: "postgresql://example" },
    run,
  );
  setup(
    {
      HTY_SETUP_DATABASE: "true",
      VERCEL_ENV: "preview",
      DATABASE_URL: "postgresql://example",
    },
    run,
  );
  assert.equal(calls, 0);
});
test("database setup requires a connection before any mutation", () => {
  assert.throws(
    () =>
      setup({ HTY_SETUP_DATABASE: "true", VERCEL_ENV: "production" }, () =>
        assert.fail("must not run"),
      ),
    /DATABASE_URL/,
  );
});
test("migration failure prevents seeding", () => {
  const calls: string[] = [];
  assert.throws(
    () =>
      setup(
        {
          HTY_SETUP_DATABASE: "true",
          VERCEL_ENV: "production",
          DATABASE_URL: "postgresql://example",
        },
        (script) => {
          calls.push(script);
          throw new Error("migration failed");
        },
      ),
    /migration failed/,
  );
  assert.deepEqual(calls, ["db:migrate"]);
});
test("migrations prefer direct connections while seeding uses the application connection", () => {
  const calls: Array<[string, string]> = [];
  setup(
    {
      HTY_SETUP_DATABASE: "true",
      VERCEL_ENV: "production",
      DATABASE_URL: "pooled",
      DATABASE_URL_UNPOOLED: "direct",
    },
    (script, env) => calls.push([script, env.DATABASE_URL]),
  );
  assert.deepEqual(calls, [
    ["db:migrate", "direct"],
    ["seed", "pooled"],
  ]);
});

test("admin setup is opt-in and production-only", () => {
  let calls = 0;
  setup({ VERCEL_ENV: "production", DATABASE_URL: "test" }, () => calls++);
  setup({ HTY_SETUP_ADMIN: "true", VERCEL_ENV: "preview" }, () => calls++);
  assert.equal(calls, 0);
});
test("invalid admin credentials prevent all setup mutations", () => {
  assert.throws(
    () =>
      setup(
        {
          HTY_SETUP_DATABASE: "true",
          HTY_SETUP_ADMIN: "true",
          VERCEL_ENV: "production",
          DATABASE_URL: "test",
          ADMIN_EMAIL: "bad",
          ADMIN_PASSWORD: "short",
          AUTH_SECRET: "short",
        },
        () => assert.fail("must not mutate"),
      ),
    /ADMIN_EMAIL/,
  );
});
test("admin creation can run independently after database initialization", () => {
  const calls: string[] = [];
  setup(
    {
      HTY_SETUP_ADMIN: "true",
      VERCEL_ENV: "production",
      DATABASE_URL: "test",
      ADMIN_EMAIL: "admin@example.invalid",
      ADMIN_PASSWORD: "Test-only-password!",
      AUTH_SECRET: "test-only-secret".repeat(3),
    },
    (script) => {
      calls.push(script);
    },
  );
  assert.deepEqual(calls, ["admin:bootstrap"]);
});
