const { getDMMF } = require("@prisma/internals");
const { readFile } = require("node:fs/promises");
(async () => {
  const schema = await getDMMF({
    datamodel: await readFile("prisma/schema.prisma", "utf8"),
  });
  console.log(`Validated ${schema.datamodel.models.length} Prisma models.`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
