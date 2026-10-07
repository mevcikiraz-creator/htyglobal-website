// One-time, explicitly enabled setup for the connected production database.
const { spawnSync } = require("node:child_process");
function setup(env, run) {
  const databaseSetup = env.HTY_SETUP_DATABASE === "true";
  const adminSetup = env.HTY_SETUP_ADMIN === "true";
  if (!databaseSetup && !adminSetup) return;
  if (env.VERCEL_ENV !== "production") {
    console.log(
      "Database/admin setup is restricted to the production deployment.",
    );
    return;
  }
  if (!env.DATABASE_URL)
    throw new Error(
      "Connect PostgreSQL and set DATABASE_URL before enabling setup.",
    );
  if (adminSetup) {
    const validEmail = require("zod")
      .z.email()
      .safeParse(env.ADMIN_EMAIL?.trim()).success;
    if (
      !validEmail ||
      !env.ADMIN_PASSWORD ||
      env.ADMIN_PASSWORD.length < 12 ||
      Buffer.byteLength(env.ADMIN_PASSWORD) > 72 ||
      !env.AUTH_SECRET ||
      env.AUTH_SECRET.length < 32
    )
      throw new Error(
        "Admin setup requires ADMIN_EMAIL, ADMIN_PASSWORD (12+ characters, up to 72 bytes), and AUTH_SECRET (32+ characters).",
      );
  }
  if (databaseSetup) {
    // Neon provides a direct connection for migration operations.
    run("db:migrate", {
      ...env,
      DATABASE_URL: env.DATABASE_URL_UNPOOLED || env.DATABASE_URL,
    });
    run("seed", env);
    console.log(
      "Database setup completed. Remove HTY_SETUP_DATABASE after verifying the site.",
    );
  }
  if (adminSetup) {
    run("admin:bootstrap", env);
    console.log(
      "Admin setup completed. Remove HTY_SETUP_ADMIN, ADMIN_EMAIL and ADMIN_PASSWORD after signing in.",
    );
  }
}
module.exports = { setup };
if (require.main === module) {
  try {
    setup(process.env, (script, env) => {
      const result = spawnSync("npm", ["run", script], {
        env,
        stdio: "inherit",
      });
      if (result.error || result.status !== 0)
        throw new Error(script + " failed; deployment stopped.");
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
