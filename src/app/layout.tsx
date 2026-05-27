import type { Metadata } from "next";
import AppShellClient from "@/components/AppShellClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "BundaCare",
  description:
    "Dashboard pemantauan ibu hamil dan menyusui untuk admin puskesmas, kader, dan keluarga.",
}; 

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..700,0..1,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppShellClient>{children}</AppShellClient>
      </body>
    </html>
  );
}
