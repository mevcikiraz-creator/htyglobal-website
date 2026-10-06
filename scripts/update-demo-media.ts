import "dotenv/config";
import { get, save } from "../src/lib/store";
import { sampleData } from "../src/lib/content";
for (const sample of sampleData().products) {
  const row = await get("products", sample.id);
  if (row && String(row.data?.image).includes("sample-interior"))
    await save("products", {
      ...row,
      data: {
        ...row.data,
        image: sample.data?.image,
        gallery: sample.data?.gallery,
      },
    });
}
process.exit(0);
