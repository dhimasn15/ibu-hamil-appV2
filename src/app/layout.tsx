import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
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
        <div className="app-shell">
          <div className="app-backdrop" />
          <Navbar />
          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
