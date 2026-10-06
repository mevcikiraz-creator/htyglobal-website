// Pinned official Prisma generators use integrity-checked WASM from npm.
// No artifact checks or TLS verification are bypassed.
const { getGenerators } = require("@prisma/internals");
const { PrismaClientTsGenerator } = require("@prisma/client-generator-ts");
(async () => {
  const generators = await getGenerators({
    schemaPath: "prisma/schema.prisma",
    registry: {
      "prisma-client": {
        type: "in-process",
        generator: new PrismaClientTsGenerator(),
      },
    },
    skipDownload: true,
    cliCommand: "generate",
  });
  try {
    for (const generator of generators) await generator.generate();
    console.log("Prisma client generated with official WASM-backed packages.");
  } finally {
    for (const generator of generators) generator.stop();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
