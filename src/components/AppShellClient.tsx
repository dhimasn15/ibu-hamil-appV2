"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

type AppShellClientProps = {
  children: ReactNode;
};

export default function AppShellClient({ children }: AppShellClientProps) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) {
    return (
      <div className="app-shell">
        <main className="min-h-screen w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
