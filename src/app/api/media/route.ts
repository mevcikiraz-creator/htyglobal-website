import { boundedFormData, sameOrigin } from "@/lib/request";
import { session } from "@/lib/auth";
import { upload } from "@/lib/storage";
export async function POST(request: Request) {
  if (!(await session()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(request, true))
    return Response.json({ error: "Invalid origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024)
    return Response.json({ error: "Too large" }, { status: 413 });
  try {
    const form = await boundedFormData(request, 11 * 1024 * 1024);
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("Select an image");
    const media = await upload(file, false);
    return Response.json({ id: media.id, url: "/api/media/" + media.id });
  } catch {
    return Response.json(
      { error: "Upload failed. Use JPG, PNG, WebP or PDF up to 10 MB." },
      { status: 400 },
    );
  }
}
