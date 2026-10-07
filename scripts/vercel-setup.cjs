// One-time, explicitly enabled setup for the connected production database.
const { spawnSync } = require("node:child_process");
function setup(env, run) {
  if (env.HTY_SETUP_DATABASE !== "true") return;
  if (env.VERCEL_ENV !== "production") {
    console.log("Database setup is restricted to the production deployment.");
    return;
  }
  if (!env.DATABASE_URL)
    throw new Error(
      "Connect PostgreSQL and set DATABASE_URL before enabling database setup.",
    );
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
