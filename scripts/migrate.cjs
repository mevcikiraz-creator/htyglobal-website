require("dotenv/config");
const { SchemaEngine } = require("@prisma/schema-engine-wasm");
const { PrismaPg } = require("@prisma/adapter-pg");
const {
  bindMigrationAwareSqlAdapterFactory,
} = require("@prisma/driver-adapter-utils");
const { readFile, mkdir, writeFile, readdir } = require("node:fs/promises");
const path = require("node:path");
(async () => {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const datamodel = await readFile("prisma/schema.prisma", "utf8");
  const engine = await SchemaEngine.new(
    { datamodels: [["prisma/schema.prisma", datamodel]] },
    () => {},
    bindMigrationAwareSqlAdapterFactory(
      new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    ),
  );
  const filters = { externalTables: [], externalEnums: [] };
  try {
    if (process.argv.includes("--create-initial")) {
      const result = await engine.diff({
        from: { tag: "empty" },
        to: {
          tag: "schemaDatamodel",
          files: [{ path: "schema.prisma", content: datamodel }],
        },
        script: true,
        exitCode: null,
        filters,
      });
      await mkdir("prisma/migrations/20261006000000_initial", {
        recursive: true,
      });
      await writeFile(
        "prisma/migrations/20261006000000_initial/migration.sql",
        result.stdout,
      );
      await writeFile(
        "prisma/migrations/migration_lock.toml",
        'provider = "postgresql"\n',
      );
      console.log("Initial migration generated.");
    } else {
      const baseDir = path.resolve("prisma/migrations");
      const dirs = (await readdir(baseDir, { withFileTypes: true }))
        .filter((x) => x.isDirectory())
        .map((x) => x.name)
        .sort();
      const migrationDirectories = [];
      for (const dir of dirs)
        migrationDirectories.push({
          path: dir,
          migrationFile: {
            path: "migration.sql",
            content: {
              tag: "ok",
              value: await readFile(
                path.join(baseDir, dir, "migration.sql"),
                "utf8",
              ),
            },
          },
        });
      const result = await engine.applyMigrations({
        migrationsList: {
          baseDir,
          lockfile: {
            path: "migration_lock.toml",
            content: await readFile(
              path.join(baseDir, "migration_lock.toml"),
              "utf8",
            ),
          },
          shadowDbInitScript: "",
          migrationDirectories,
        },
        filters,
      });
      console.log("Applied migrations:", result.appliedMigrationNames);
    }
  } finally {
    engine.free();
  }
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
