"use client";
import { useState } from "react";
import { woods } from "@/lib/woods";
export default function ContentEditor({
  initial,
  kind,
}: {
  initial: Record<string, unknown>;
  kind: string;
}) {
  const [data, setData] = useState(initial);
  const [raw, setRaw] = useState(JSON.stringify(initial, null, 2));
  const [error, setError] = useState("");
  const update = (key: string, value: unknown) => {
    const next = { ...data, [key]: value };
    setData(next);
    setRaw(JSON.stringify(next, null, 2));
  };
  const fields =
    kind === "settings"
      ? [
          "email",
          "phone",
          "whatsapp",
          "address",
          "linkedin",
          "instagram",
          "youtube",
          "logo",
          "favicon",
          "footer",
          "imageryNotice",
          "seoTitle",
          "seoDescription",
        ]
      : kind === "home"
        ? [
            "eyebrow",
            "image",
            "imageAlt",
            "heroVideo",
            "heroVideoMode",
            "introTitle",
            "selectedWorkTitle",
            "productTitle",
            "sectorTitle",
            "ctaTitle",
            "manufacturingTitle",
            "manufacturingText",
            "manufacturingImage",
            "sampleNotice",
            "seoTitle",
            "seoDescription",
          ]
        : [
            "image",
            "imageAlt",
            "body",
            ...(kind === "products"
              ? [
                  "code",
                  "dimensions",
                  "materials",
                  "finishes",
                  "pdf",
                  "defaultWood",
                  "woodBeechImage",
                  "woodWalnutImage",
                  "woodOakImage",
                  "woodAshImage",
                ]
              : kind === "projects"
                ? [
                    "location",
                    "country",
                    "year",
                    "client",
                    "scope",
                    "specifications",
                    "video",
                  ]
                : []),
            "seoTitle",
            "seoDescription",
          ];
  const gallery = Array.isArray(data.gallery) ? data.gallery.map(String) : [];
  async function files(input: FileList | null) {
    if (!input) return;
    setError("Uploading…");
    const urls = [];
    try {
      for (const file of Array.from(input)) {
        const body = new FormData();
        body.set("file", file);
        const res = await fetch("/api/media", { method: "POST", body });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error);
        urls.push(result.url);
      }
      update("gallery", [...gallery, ...urls]);
      setError("Images uploaded. Save the record to attach them.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }
  return (
    <>
      <div className="form-grid">
        {fields.map((k) => (
          <label key={k}>
            {k === "body"
              ? "Full description / content"
              : k.replace(/([A-Z])/g, " $1")}
            {k === "heroVideoMode" ? (
              <select
                value={String(data[k] || "scroll")}
                onChange={(e) => update(k, e.target.value)}
              >
                <option value="scroll">Scroll-controlled film</option>
                <option value="loop">Looping film</option>
              </select>
            ) : k === "defaultWood" ? (
              <select
                value={String(data[k] || "")}
                onChange={(e) => update(k, e.target.value)}
              >
                <option value="">First available preview</option>
                {woods.map((wood) => (
                  <option key={wood.id} value={wood.id}>
                    {wood.en} / {wood.tr}
                  </option>
                ))}
              </select>
            ) : k === "body" || /Title$/.test(k) ? (
              <textarea
                rows={k === "body" ? 6 : 2}
                value={String(data[k] || "")}
                onChange={(e) => update(k, e.target.value)}
              />
            ) : (
              <input
                value={String(data[k] || "")}
                onChange={(e) => update(k, e.target.value)}
              />
            )}
          </label>
        ))}
      </div>
      {["products", "projects"].includes(kind) && (
        <>
          <h2>Image gallery</h2>
          <label>
            Upload multiple images
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => files(e.target.files)}
            />
          </label>
          {gallery.map((url, i) => (
            <div className="gallery-editor" key={i}>
              <input
                aria-label={`Image ${i + 1} URL`}
                value={url}
                onChange={(e) =>
                  update(
                    "gallery",
                    gallery.map((x, n) => (n === i ? e.target.value : x)),
                  )
                }
              />
              <button
                type="button"
                disabled={i === 0}
                onClick={() => {
                  const next = [...gallery];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  update("gallery", next);
                }}
              >
                Move up
              </button>
              <button
                type="button"
                disabled={i === gallery.length - 1}
                onClick={() => {
                  const next = [...gallery];
                  [next[i + 1], next[i]] = [next[i], next[i + 1]];
                  update("gallery", next);
                }}
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  update(
                    "gallery",
                    gallery.filter((_, n) => n !== i),
                  )
                }
              >
                Remove
              </button>
              <button type="button" onClick={() => update("image", url)}>
                Use as cover
              </button>
            </div>
          ))}
          <button
            type="button"
            className="text-link"
            onClick={() => update("gallery", [...gallery, ""])}
          >
            Add reusable image URL +
          </button>
        </>
      )}
      <label style={{ marginTop: 30 }}>
        Advanced content (JSON)
        <textarea
          className="json"
          name="data"
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            try {
              const parsed = JSON.parse(e.target.value);
              if (
                !parsed ||
                Array.isArray(parsed) ||
                typeof parsed !== "object"
              )
                throw new Error();
              setData(parsed);
              setError("");
            } catch {
              setError("Enter a valid JSON object before saving.");
            }
          }}
          required
        />
      </label>
      <p role="status">{error}</p>
    </>
  );
}
