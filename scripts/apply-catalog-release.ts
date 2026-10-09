import "dotenv/config";
import { applyCatalogRelease } from "../src/lib/catalog-release";
import { applyProjectRelease } from "../src/lib/project-release";
import { get, save } from "../src/lib/store";
if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "Connect the production PostgreSQL database before deploying the collection.",
    );
  const count = await applyCatalogRelease({ get, save });
  const projects = await applyProjectRelease({ get, save });
  console.log(
    `Collection release: ${count} original sample records updated. Custom content and users preserved.`,
  );
  console.log(
    `Project release: ${projects} supplied project imported. Existing CMS edits preserved.`,
  );
} else {
  console.log("Production collection release skipped for this environment.");
}
process.exit(0);
