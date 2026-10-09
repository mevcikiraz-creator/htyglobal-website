import "dotenv/config";
import { applyCatalogRelease } from "../src/lib/catalog-release";
import { get, save } from "../src/lib/store";
if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DATABASE_URL)
    throw new Error(
      "Connect the production PostgreSQL database before deploying the collection.",
    );
  const count = await applyCatalogRelease({ get, save });
  console.log(
    `Collection release: ${count} original sample records updated. Custom content and users preserved.`,
  );
} else {
  console.log("Production collection release skipped for this environment.");
}
process.exit(0);
