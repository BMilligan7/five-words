import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Five Words",
  description: "A photo. Five words. Your first impression.",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
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
