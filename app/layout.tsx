import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ECHO Station — Agent Swarm Missions",
  description: "Three cinematic 3D missions where four agents discover evidence, share knowledge, recover from faults, and coordinate a solution.",
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
