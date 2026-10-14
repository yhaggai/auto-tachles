import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
export const metadata: Metadata = {
  title: "אוטו תכל׳ס | דמו עם נתונים פיקטיביים",
  description:
    "Auto Tachles concept demo. All vehicle locations, discounts and fuel levels are fictional. No live AutoTel data.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="stylesheet" href="/vendor/leaflet.css" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
