"use client";
import Arrow from "./arrow";
import { useState } from "react";
import { woods, type WoodId } from "@/lib/woods";
export function InquiryForm({
  quote = false,
  locale = "en",
  product,
}: {
  quote?: boolean;
  locale?: string;
  product?: { slug: string; title: string; code: string; wood?: WoodId };
}) {
  const [state, setState] = useState("");
  const [busy, setBusy] = useState(false);
  const names: Record<string, string> = {
    Name: "Ad Soyad",
    Company: "Şirket",
    Email: "E-posta",
    Phone: "Telefon",
    Country: "Ülke",
    Subject: "Konu",
    "Project Name": "Proje Adı",
    "Project Location": "Proje Konumu",
    "Project Type": "Proje Türü",
    Quantity: "Tahmini Adet",
  };
  const fields = quote
    ? [
        "Name",
        "Company",
        "Email",
        "Phone",
        "Country",
        "Project Name",
        "Project Location",
        "Project Type",
        "Quantity",
      ]
    : ["Name", "Company", "Email", "Phone", "Country", "Subject"];
  return (
    <form
      className="inquiry"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setBusy(true);
        setState("");
        try {
          const response = await fetch("/api/inquiries", {
            method: "POST",
            body: new FormData(form),
          });
          const body = await response.json();
          if (!response.ok) throw new Error(body.error);
          setState(
            locale === "tr"
              ? "Teşekkürler. Mesajınız kaydedildi."
              : "Thank you. Your inquiry has been received.",
          );
          form.reset();
        } catch (e) {
          setState(
            e instanceof Error
              ? e.message
              : "Unable to send. Please try again.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <input type="hidden" name="kind" value={quote ? "quote" : "contact"} />
      {quote && product && (
        <div className="quote-product-summary">
          <p className="eyebrow">
            {locale === "tr" ? "SEÇTİĞİNİZ ÜRÜN" : "YOUR SELECTED PRODUCT"}
          </p>
          <h3>{product.title}</h3>
          <p>
            {product.code}
            {product.wood
              ? ` · ${woods.find((wood) => wood.id === product.wood)?.[locale === "tr" ? "tr" : "en"]}`
              : ""}
          </p>
          <input type="hidden" name="productSlug" value={product.slug} />
          <input type="hidden" name="woodType" value={product.wood || ""} />
        </div>
      )}
      <div className="form-grid">
        {fields.map((label) => {
          const name =
            label[0].toLowerCase() + label.slice(1).replaceAll(" ", "");
          return (
            <label key={name}>
              {locale === "tr" ? names[label] : label}
              <input
                name={name}
                type={name === "email" ? "email" : "text"}
                required={["name", "email"].includes(name)}
                maxLength={200}
              />
            </label>
          );
        })}
      </div>
      <label>
        {locale === "tr" ? "Mesaj" : "Message"}
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={10000}
          rows={5}
        />
      </label>
      {quote && (
        <label>
          Project files (optional)
          <input
            type="file"
            name="files"
            multiple
            accept=".pdf,.xls,.xlsx,.dwg,.zip,.jpg,.jpeg,.png,.webp"
          />
          <small>
            Up to 3 files, 10 MB each. PDF, spreadsheets, DWG, ZIP or images. Do
            not include sensitive personal information.
          </small>
        </label>
      )}
      <label className="honeypot" aria-hidden="true">
        Website
        <input name="website" tabIndex={-1} />
      </label>
      <p className="muted">
        Your details are used to respond to this inquiry. Files remain
        accessible only to our team.
      </p>
      <button disabled={busy} className="button dark">
        {busy ? "Sending…" : locale === "tr" ? "Gönder" : "Send inquiry"}
        <Arrow direction="right" />
      </button>
      <p role="status">{state}</p>
    </form>
  );
}
export function MediaUpload() {
  const [message, setMessage] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setMessage("Uploading…");
        try {
          const res = await fetch("/api/media", {
            method: "POST",
            body: new FormData(e.currentTarget),
          });
          const result = await res.json();
          setMessage(
            res.ok ? "Uploaded. Reusable URL: " + result.url : result.error,
          );
        } catch {
          setMessage("Upload failed");
        }
      }}
    >
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        required
      />
      <button className="button dark">Upload media</button>
      <p role="status">{message}</p>
    </form>
  );
}
