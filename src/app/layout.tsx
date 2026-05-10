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
      <body>
        <AppShellClient>{children}</AppShellClient>
      </body>
    </html>
  );
}
