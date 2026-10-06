import "server-only";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { dataDir, save } from "./store";
export interface StorageAdapter {
  put(key: string, bytes: Buffer): Promise<void>;
  read(key: string): Promise<Buffer>;
}
// Replace this adapter with an S3-compatible implementation for multi-instance deployments.
export const storage: StorageAdapter = {
  async put(key, bytes) {
    await mkdir(path.join(dataDir, "uploads"), { recursive: true });
    await writeFile(path.join(dataDir, "uploads", path.basename(key)), bytes, {
      mode: 0o600,
    });
  },
  async read(key) {
    return readFile(path.join(dataDir, "uploads", path.basename(key)));
  },
};
export async function upload(file: File, privateFile: boolean) {
  if (file.size > 10 * 1024 * 1024 || !file.size)
    throw new Error("Each file must be between 1 byte and 10 MB");
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const allowed = privateFile
    ? ["pdf", "xls", "xlsx", "dwg", "zip", "jpg", "jpeg", "png", "webp"]
    : ["jpg", "jpeg", "png", "webp", "pdf"];
  if (!allowed.includes(ext)) throw new Error("Unsupported file type");
  let bytes = Buffer.from(await file.arrayBuffer());
  let mime = "application/octet-stream";
  let suffix = ext;
  if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
    bytes = await sharp(bytes, { limitInputPixels: 40000000 })
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    mime = "image/webp";
    suffix = "webp";
  } else if (ext === "pdf") {
    if (bytes.subarray(0, 5).toString() !== "%PDF-")
      throw new Error("Invalid PDF");
    mime = "application/pdf";
  } else if (["zip", "xlsx"].includes(ext)) {
    if (bytes.subarray(0, 2).toString() !== "PK")
      throw new Error("Invalid archive");
  } else if (ext === "dwg") {
    if (!bytes.subarray(0, 6).toString().startsWith("AC10"))
      throw new Error("Invalid DWG");
  } else if (ext === "xls") {
    if (bytes.subarray(0, 4).toString("hex") !== "d0cf11e0")
      throw new Error("Invalid XLS");
  }
  const id = randomUUID(),
    key = id + "." + suffix;
  await storage.put(key, bytes);
  return save("media", {
    id,
    filename: (mime === "image/webp"
      ? file.name.replace(/\.[^.]+$/, "") + ".webp"
      : file.name
    ).slice(0, 200),
    mimeType: mime,
    size: bytes.length,
    storageKey: key,
    alt: file.name,
    private: privateFile,
  });
}
