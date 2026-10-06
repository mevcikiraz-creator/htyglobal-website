import { get } from "@/lib/store";
import { session } from "@/lib/auth";
import { storage } from "@/lib/storage";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const media = await get("media", id);
  if (!media) return new Response("Not found", { status: 404 });
  if (media.private && !(await session()))
    return new Response("Unauthorized", { status: 401 });
  try {
    const bytes = await storage.read(String(media.storageKey));
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": String(media.mimeType),
        "Content-Disposition": `${media.private || !String(media.mimeType).startsWith("image/") ? "attachment" : "inline"}; filename="${String(media.filename).replace(/[^a-zA-Z0-9._-]/g, "_")}"`,
        "Cache-Control": media.private
          ? "private, no-store"
          : "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
