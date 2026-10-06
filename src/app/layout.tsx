import { headers } from "next/headers";
import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "HTY Global — Contract Furniture",
  description: "Considered furniture for international projects.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = (await headers()).get("x-hty-locale") || "en";
  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
