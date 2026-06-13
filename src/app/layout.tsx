import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baby Haus | Premium Baby Products Cambodia",
  description: "High quality baby products from USA & Japan. Online based in Cambodia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
