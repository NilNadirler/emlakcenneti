
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EmlakCenneti | Hayalindeki Evi Keşfet",
  description:
    "Satılık ve kiralık evleri keşfet, sana uygun emlak ilanını bul.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
