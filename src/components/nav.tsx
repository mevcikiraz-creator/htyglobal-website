"use client";
import Link from "next/link";
import { useState } from "react";
export default function Nav({
  locale = "en",
  brand = "HTY GLOBAL",
  logo = "/hty-logo.png",
  transparent = false,
}: {
  locale?: string;
  brand?: string;
  logo?: string;
  transparent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const prefix = locale === "tr" ? "/tr" : "";
  const tr = locale === "tr";
  const groups = [
    [
      { path: "projects", label: tr ? "Projeler" : "Projects" },
      { path: "products", label: tr ? "Ürünler" : "Products" },
      { path: "about", label: tr ? "Hakkımızda" : "About" },
    ],
    [
      { path: "manufacturing", label: tr ? "Üretim" : "Manufacturing" },
      { path: "contact", label: tr ? "İletişim" : "Contact" },
    ],
  ];
  return (
    <header className={transparent ? "nav nav-over-film" : "nav"}>
      <Link
        href={prefix || "/"}
        className="brand"
        aria-label={brand}
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
        id="main-navigation"
        className={open ? "nav-links open" : "nav-links"}
        aria-label="Main navigation"
        lang={locale}
      >
        {groups.map((links, index) => (
          <div
            key={index}
            className={`nav-group ${index === 0 ? "nav-left" : "nav-right"}`}
          >
            {links.map(({ path, label }) => (
              <Link
                key={path}
                href={`${prefix}/${path}`}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            {index === 1 && (
              <div className="nav-end">
                <Link
                  href={`${prefix}/materials`}
                  onClick={() => setOpen(false)}
                >
                  {tr ? "Malzemeler" : "Materials"}
                </Link>
                {/* Reload the root layout so the document language follows the locale. */}
                <a
                  href={tr ? "/" : "/tr"}
                  onClick={() => setOpen(false)}
                  className="language"
                >
                  {tr ? "EN" : "TR"}
                </a>
              </div>
            )}
          </div>
        ))}
      </nav>
      <button
        className="menu-button"
        aria-expanded={open}
        aria-controls="main-navigation"
        aria-label="Toggle menu"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {open ? "Close −" : "Menu +"}
      </button>
    </header>
  );
}
