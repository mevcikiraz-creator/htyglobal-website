"use client";
import Link from "next/link";
import { useState } from "react";
export default function Nav({
  locale = "en",
  brand = "HTY GLOBAL",
  logo = "",
}: {
  locale?: string;
  brand?: string;
  logo?: string;
}) {
  const [open, setOpen] = useState(false);
  const prefix = locale === "tr" ? "/tr" : "";
  const labels =
    locale === "tr"
      ? ["Projeler", "Ürünler", "Hakkımızda", "Üretim", "İletişim"]
      : ["Projects", "Products", "About", "Manufacturing", "Contact"];
  return (
    <header className="nav">
      <Link
        href={prefix || "/"}
        className="brand"
        onClick={() => setOpen(false)}
      >
        {logo ? (
          <span
            style={{ backgroundImage: `url(${logo})` }}
            className="brand-image"
          />
        ) : (
          brand
        )}
        <small>CONTRACT FURNITURE</small>
      </Link>
      <nav
        className={open ? "nav-links open" : "nav-links"}
        aria-label="Main navigation"
      >
        {["projects", "products", "about", "manufacturing", "contact"].map(
          (p, i) => (
            <Link
              key={p}
              href={`${prefix}/${p}`}
              onClick={() => setOpen(false)}
            >
              {labels[i]}
            </Link>
          ),
        )}
        <Link
          href={locale === "tr" ? "/" : "/tr"}
          onClick={() => setOpen(false)}
          className="language"
        >
          {locale === "tr" ? "EN" : "TR"}
        </Link>
      </nav>
      <button
        className="menu-button"
        aria-expanded={open}
        aria-label="Toggle menu"
        onClick={() => setOpen(!open)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
    </header>
  );
}
