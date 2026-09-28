import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECHO Station — The Last Signal",
  description: "A cinematic 3D escape room. Watch four agents discover evidence, coordinate, and find a way out.",
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
