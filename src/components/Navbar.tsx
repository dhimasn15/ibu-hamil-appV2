"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from 'next/image';
import { useState } from "react";

const links = [
  { href: "/", label: "Beranda" },
  { href: "/cekdata", label: "Cek Data Ibu" },
  { href: "/login", label: "Login Admin" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-30 overflow-hidden ">
            <Image
              src="/image/kpilmu.png"
              alt="Logo KP Ilmu"
              fill
              sizes="120px"
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

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-amber-50 hover:text-amber-700 md:hidden"
          aria-label="Buka menu navigasi"
          aria-expanded={menuOpen}
        >
          <span className="flex flex-col gap-1.5">
            <span className={cn("h-0.5 w-5 rounded-full bg-current transition", menuOpen && "translate-y-2 rotate-45")} />
            <span className={cn("h-0.5 w-5 rounded-full bg-current transition", menuOpen && "opacity-0")} />
            <span className={cn("h-0.5 w-5 rounded-full bg-current transition", menuOpen && "-translate-y-2 -rotate-45")} />
          </span>
        </button>

        <nav className="hidden flex-wrap gap-2 md:flex">
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
                    ? "bg-amber-500 hover:bg-amber-600 hover:text-slate-900"
                    : "text-slate-600 hover:bg-white hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {menuOpen && (
        <nav className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 pb-4 md:hidden">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  active
                    ? "bg-amber-500 text-slate-950"
                    : "bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
