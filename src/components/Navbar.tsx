"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from 'next/image';

const links = [
  { href: "/", label: "Beranda" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/ibu-hamil", label: "Data Ibu" },
  { href: "/login", label: "Login Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-30 overflow-hidden ">
            <Image
              src="/image/kpilmu.png"
              alt="Logo KP Ilmu"
              fill
              className="object-cover" 
              priority
            />
          </div>
          <div>
            <p className="font-heading text-lg font-bold text-slate-900">
              BundaCare
            </p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
              Monitoring ibu & keluarga
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-amber-500 text-white"
                    : "text-slate-600 hover:bg-white hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
