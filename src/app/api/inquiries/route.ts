import { ZodError } from "zod";
import { boundedFormData, sameOrigin } from "@/lib/request";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { inquirySchema } from "@/lib/validation";
import { get, save } from "@/lib/store";
import { woods } from "@/lib/woods";
import { upload } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 32 * 1024 * 1024)
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  if (
    !(await rateLimit(
      "inquiry:" + (request.headers.get("x-forwarded-for") || "local"),
      8,
    ))
  )
    return NextResponse.json(
      { error: "Please try again later." },
      { status: 429 },
    );
  try {
    const form = await boundedFormData(request, 32 * 1024 * 1024);
    if (form.get("website")) return NextResponse.json({ ok: true });
    const data = inquirySchema.parse(
      Object.fromEntries(
        [...form.entries()].filter(([, v]) => typeof v === "string"),
      ),
    );
    const quote = form.get("kind") === "quote";
    const selectedProduct =
      quote && data.productSlug
        ? await get("products", data.productSlug)
        : undefined;
    if (
      quote &&
      data.productSlug &&
      (!selectedProduct || selectedProduct.status !== "PUBLISHED")
    )
      return NextResponse.json(
        { error: "The selected product is not available." },
        { status: 400 },
      );
    const files = form
      .getAll("files")
      .filter((v): v is File => v instanceof File && v.size > 0);
    if (
      files.length > 3 ||
      files.reduce((n, f) => n + f.size, 0) > 30 * 1024 * 1024
    )
      throw new Error("Maximum 3 files, 30 MB total");
    const attachments = [];
    for (const file of files) attachments.push((await upload(file, true)).id);
    const {
      projectName,
      projectLocation,
      projectType,
      quantity,
      productSlug: _productSlug,
      woodType,
      ...fields
    } = data;
    void _productSlug;
    await save(quote ? "quotes" : "contacts", {
      id: randomUUID(),
      ...fields,
      status: "NEW",
      data: {
        projectName,
        projectLocation,
        projectType,
        quantity,
        attachments,
        ...(selectedProduct
          ? {
              selectedProductId: selectedProduct.id,
              selectedProduct: selectedProduct.title,
              selectedProductCode: selectedProduct.data?.code || "",
              woodType,
              wood: woods.find((wood) => wood.id === woodType)?.tr || "",
            }
          : {}),
      },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const invalid =
      e instanceof ZodError ||
      (e instanceof Error &&
        /file|PDF|archive|DWG|XLS|too large|Unsupported/i.test(e.message));
    return NextResponse.json(
      {
        error: invalid
          ? "Please check your fields and attachments."
          : "Unable to save your inquiry. Please try again later.",
      },
      { status: invalid ? 400 : 500 },
    );
  }
}
