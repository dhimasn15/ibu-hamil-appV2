"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";
import type { LoginRecord, MotherProfile, RiskLevel } from "@/lib/types";
import {
  formatBabyHistoryLabel,
  formatCategoryLabel,
  formatRiskLabel,
} from "@/lib/utils";
import MapPanel from "@/components/MapPanel";

type Props = {
  currentAdmin: AdminSession;
  mothers: MotherProfile[];
  loginHistory: LoginRecord[];
};

type Section = "ringkasan" | "data-ibu" | "peta" | "statistik" | "riwayat";

const NAV = [
  { id: "ringkasan", label: "Ringkasan", icon: "grid" },
  { id: "data-ibu", label: "Data Ibu", icon: "users" },
  { id: "peta", label: "Peta Wilayah", icon: "map" },
  { id: "statistik", label: "Statistik", icon: "chart" },
  { id: "riwayat", label: "Riwayat Login", icon: "clock" },
] as const;

const RISK_STYLE: Record<
  RiskLevel,
  { pill: string; dot: string; bar: string; text: string }
> = {
  tinggi: {
    pill: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    text: "text-rose-700",
  },
  sedang: {
    pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    text: "text-amber-700",
  },
  rendah: {
    pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    text: "text-emerald-700",
  },
};

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name: string;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  if (name === "search") {
    return (
      <svg {...common}>
        <path d="m21 21-4.3-4.3" />
        <circle cx="11" cy="11" r="7" />
      </svg>
    );
  }

  if (name === "bell") {
    return (
      <svg {...common}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M13.7 21a2 2 0 0 1-3.4 0" />
      </svg>
    );
  }

  if (name === "grid") {
    return (
      <svg {...common}>
        <path d="M4 4h6v6H4z" />
        <path d="M14 4h6v6h-6z" />
        <path d="M4 14h6v6H4z" />
        <path d="M14 14h6v6h-6z" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg {...common}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  }

  if (name === "map") {
    return (
      <svg {...common}>
        <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
        <path d="M9 3v15" />
        <path d="M15 6v15" />
      </svg>
    );
  }

  if (name === "chart") {
    return (
      <svg {...common}>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 16v-5" />
        <path d="M12 16V8" />
        <path d="M16 16v-9" />
      </svg>
    );
  }

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "refresh") {
    return (
      <svg {...common}>
        <path d="M21 12a9 9 0 0 1-15.5 6.2" />
        <path d="M3 12A9 9 0 0 1 18.5 5.8" />
        <path d="M18 2v4h4" />
        <path d="M6 22v-4H2" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function percent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function MetricCard({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string | number;
  helper: string;
  tone: "amber" | "teal" | "rose" | "slate";
}) {
  const tones = {
    amber: "from-amber-50 text-amber-700",
    teal: "from-teal-50 text-teal-700",
    rose: "from-rose-50 text-rose-700",
    slate: "from-slate-50 text-slate-700",
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
      <div
        className={`mb-9 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${tones[tone]} to-white`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      </div>
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-400">{helper}</p>
    </div>
  );
}

function Donut({
  pregnant,
  breastfeeding,
}: {
  pregnant: number;
  breastfeeding: number;
}) {
  const total = pregnant + breastfeeding || 1;
  const r = 46;
  const circumference = 2 * Math.PI * r;
  const pregnantDash = (pregnant / total) * circumference;
  const breastfeedingDash = (breastfeeding / total) * circumference;

  return (
    <div className="flex items-center justify-center gap-5">
      <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#eef2f7"
          strokeWidth="18"
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#14b8a6"
          strokeWidth="18"
          strokeDasharray={`${breastfeedingDash} ${circumference}`}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#f59e0b"
          strokeWidth="18"
          strokeDasharray={`${pregnantDash} ${circumference}`}
          strokeDashoffset={-breastfeedingDash}
          strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "64px 64px" }}
        />
        <text
          x="64"
          y="61"
          textAnchor="middle"
          fill="#0f172a"
          fontSize="20"
          fontWeight="700"
        >
          {total}
        </text>
        <text x="64" y="78" textAnchor="middle" fill="#94a3b8" fontSize="10">
          data
        </text>
      </svg>
      <div className="space-y-3 text-sm">
        <p className="flex items-center gap-2 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          Hamil <strong className="text-slate-950">{pregnant}</strong>
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
          Menyusui <strong className="text-slate-950">{breastfeeding}</strong>
        </p>
      </div>
    </div>
  );
}

function AgeBars({ mothers }: { mothers: MotherProfile[] }) {
  const ages = [
    { label: "<=20", total: mothers.filter((item) => item.age <= 20).length },
    {
      label: "21-25",
      total: mothers.filter((item) => item.age >= 21 && item.age <= 25).length,
    },
    {
      label: "26-30",
      total: mothers.filter((item) => item.age >= 26 && item.age <= 30).length,
    },
    {
      label: "31-35",
      total: mothers.filter((item) => item.age >= 31 && item.age <= 35).length,
    },
    { label: ">35", total: mothers.filter((item) => item.age > 35).length },
  ];
  const max = Math.max(...ages.map((item) => item.total), 1);

  return (
    <div className="flex h-52 items-end gap-3 border-b border-slate-100 pt-6">
      {ages.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-bold text-slate-700">{item.total}</span>
          <div className="flex h-32 w-full items-end rounded-t-xl bg-slate-50">
            <div
              className="w-full rounded-t-xl bg-amber-500 shadow-[0_8px_18px_rgba(245,158,11,0.25)]"
              style={{ height: `${Math.max((item.total / max) * 100, 8)}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function RiskRows({
  highRisk,
  midRisk,
  lowRisk,
  total,
}: {
  highRisk: number;
  midRisk: number;
  lowRisk: number;
  total: number;
}) {
  const rows = [
    { key: "rendah" as const, label: "Risiko rendah", total: lowRisk },
    { key: "sedang" as const, label: "Risiko sedang", total: midRisk },
    { key: "tinggi" as const, label: "Risiko tinggi", total: highRisk },
  ];

  return (
    <div className="space-y-4">
      {rows.map((item) => (
        <div key={item.key}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">{item.label}</span>
            <span className={`font-bold ${RISK_STYLE[item.key].text}`}>
              {item.total}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full ${RISK_STYLE[item.key].bar}`}
              style={{ width: `${percent(item.total, total)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardClient({
  currentAdmin,
  mothers,
  loginHistory,
}: Props) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("ringkasan");
  const [query, setQuery] = useState("");
  const [catF, setCatF] = useState("semua");
  const [riskF, setRiskF] = useState("semua");
  const [loggingOut, setLoggingOut] = useState(false);
  const deferredQuery = useDeferredValue(query);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  const total = mothers.length;
  const pregnant = mothers.filter((item) => item.category === "hamil").length;
  const breastfeeding = mothers.filter((item) => item.category === "menyusui").length;
  const highRisk = mothers.filter((item) => item.riskLevel === "tinggi").length;
  const midRisk = mothers.filter((item) => item.riskLevel === "sedang").length;
  const lowRisk = mothers.filter((item) => item.riskLevel === "rendah").length;

  const filtered = useMemo(
    () =>
      mothers.filter((mother) => {
        const keyword = deferredQuery.toLowerCase();
        const matchesQuery =
          mother.fullName.toLowerCase().includes(keyword) ||
          mother.village.toLowerCase().includes(keyword) ||
          mother.address.toLowerCase().includes(keyword);
        const matchesCategory = catF === "semua" || mother.category === catF;
        const matchesRisk = riskF === "semua" || mother.riskLevel === riskF;

        return matchesQuery && matchesCategory && matchesRisk;
      }),
    [catF, deferredQuery, mothers, riskF],
  );

  const topVillage = useMemo(() => {
    const counts = new Map<string, number>();
    mothers.forEach((mother) => {
      counts.set(mother.village, (counts.get(mother.village) ?? 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [mothers]);

  const activeTitle = NAV.find((item) => item.id === section)?.label ?? "Ringkasan";
  const recent = mothers.slice(0, 5);

  return (
    <div className="min-h-screen bg-amber-50/45 p-0 text-slate-950 sm:p-5 lg:p-7">
      <div className="mx-auto flex min-h-screen w-full max-w-[1800px] overflow-hidden rounded-none border border-white bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)] sm:min-h-[calc(100vh-2.5rem)] sm:rounded-[1.65rem]">
        <aside className="hidden w-[286px] shrink-0 border-r border-slate-100 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow-[0_10px_22px_rgba(245,158,11,0.24)]">
                BC
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950">
                  {currentAdmin.name}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {currentAdmin.region}
                </p>
              </div>
              <Icon name="chevron" className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <div className="border-b border-slate-100 p-4">
            <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
              <Icon name="search" className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Cari data..."
              />
            </label>
          </div>

          <nav className="flex flex-1 flex-col gap-1 p-3">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                  section === item.id
                    ? "bg-amber-500 text-white shadow-[0_10px_22px_rgba(245,158,11,0.2)]"
                    : "text-slate-400 hover:bg-amber-50 hover:text-slate-700"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4">
            <div className="rounded-2xl bg-amber-500 p-5 text-white shadow-[0_18px_36px_rgba(245,158,11,0.26)]">
              <p className="text-sm font-bold">Data aktif</p>
              <p className="mt-1 text-xs text-amber-50">
                Total ibu binaan Kecamatan Tegalwaru
              </p>
              <p className="mt-5 font-heading text-4xl font-bold">{total}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-white/15 px-2 py-2">
                  <p className="text-lg font-bold">{pregnant}</p>
                  <p className="text-[11px] text-amber-50">Hamil</p>
                </div>
                <div className="rounded-xl bg-white/15 px-2 py-2">
                  <p className="text-lg font-bold">{breastfeeding}</p>
                  <p className="text-[11px] text-amber-50">Menyusui</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-amber-50/35">
          <header className="flex flex-col gap-4 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <label className="flex max-w-xl flex-1 items-center gap-3 rounded-2xl bg-white text-slate-400">
              <Icon name="search" className="h-5 w-5 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2 text-base text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Search something..."
              />
            </label>

            <div className="flex items-center justify-between gap-3 sm:justify-end">
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label="Notifikasi"
              >
                <Icon name="bell" className="h-5 w-5" />
                <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                  A
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {currentAdmin.name}
                  </p>
                  <p className="text-xs text-slate-400">{currentAdmin.email}</p>
                </div>
                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="rounded-full border border-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                >
                  {loggingOut ? "Keluar..." : "Keluar"}
                </button>
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <section className="border-b border-slate-100 bg-white px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                  <button
                    className="mt-3 hidden text-slate-300 transition hover:text-slate-600 sm:block"
                    aria-label="Kembali"
                  >
                    <Icon name="chevron" className="h-5 w-5 rotate-180" />
                  </button>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-white shadow-[0_10px_22px_rgba(245,158,11,0.24)]">
                    B
                  </div>
                  <div>
                    <h1 className="font-heading text-2xl font-bold text-slate-950">
                      Dashboard Ibu Tegalwaru
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                      Ringkasan pemantauan ibu hamil dan menyusui.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>Status</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-600">
                    Active
                  </span>
                  <span>Wilayah</span>
                  <span className="font-semibold text-slate-900">
                    Kecamatan Tegalwaru
                  </span>
                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 hover:bg-slate-50 hover:text-slate-700"
                    aria-label="Menu lainnya"
                  >
                    <span className="text-lg leading-none">...</span>
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-6 overflow-x-auto">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`border-b-2 px-1 pb-3 text-sm font-medium transition ${
                      section === item.id
                        ? "border-amber-500 text-slate-950"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {activeTitle}
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-bold text-slate-950">
                    Overview operasional
                  </h2>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    value={catF}
                    onChange={(event) => setCatF(event.target.value)}
                    className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-amber-300"
                  >
                    <option value="semua">Semua kategori</option>
                    <option value="hamil">Ibu hamil</option>
                    <option value="menyusui">Ibu menyusui</option>
                  </select>
                  <select
                    value={riskF}
                    onChange={(event) => setRiskF(event.target.value)}
                    className="rounded-xl border border-slate-100 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-amber-300"
                  >
                    <option value="semua">Semua risiko</option>
                    <option value="rendah">Risiko rendah</option>
                    <option value="sedang">Risiko sedang</option>
                    <option value="tinggi">Risiko tinggi</option>
                  </select>
                </div>
              </div>

              {section === "ringkasan" && (
                <div className="grid gap-4 xl:grid-cols-[0.95fr_1.9fr]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MetricCard
                      label="Total data"
                      value={total}
                      helper={`${filtered.length} cocok filter`}
                      tone="amber"
                    />
                    <MetricCard
                      label="Ibu hamil"
                      value={pregnant}
                      helper={`${percent(pregnant, total)}% dari total`}
                      tone="amber"
                    />
                    <MetricCard
                      label="Ibu menyusui"
                      value={breastfeeding}
                      helper={`${percent(breastfeeding, total)}% dari total`}
                      tone="teal"
                    />
                    <MetricCard
                      label="Risiko tinggi"
                      value={highRisk}
                      helper="Prioritas kunjungan"
                      tone="rose"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
                    <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
                      <div className="flex flex-col justify-between gap-6">
                        <div>
                          <p className="text-sm text-slate-400">Wilayah padat</p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            {topVillage?.[0] ?? "Tegalwaru"}
                          </p>
                          <p className="mt-5 text-sm text-slate-400">Data terfilter</p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            {filtered.length} ibu
                          </p>
                          <p className="mt-5 text-sm text-slate-400">Periode</p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            Bulan ini
                          </p>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-bold text-amber-700">
                          <Icon name="refresh" className="h-4 w-4" />
                          Refresh data
                        </button>
                      </div>
                      <div className="[&>div]:h-full [&>div]:min-h-[360px] [&>div]:border-slate-100 [&>div]:bg-slate-50">
                        <MapPanel mothers={filtered.length ? filtered : mothers} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.04)] xl:col-span-2">
                    <div className="grid divide-y divide-slate-100 xl:grid-cols-[1fr_1fr_1fr] xl:divide-x xl:divide-y-0">
                      <div className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-950">
                              Ibu prioritas
                            </p>
                            <p className="text-xs text-slate-400">
                              Berdasarkan data terbaru
                            </p>
                          </div>
                          <span className="text-xs font-bold text-amber-700">
                            + Tambah data
                          </span>
                        </div>
                        <div className="space-y-3">
                          {recent.map((mother) => (
                            <div
                              key={mother.id}
                              className="grid grid-cols-[1fr_58px_78px] items-center gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                  {mother.fullName.slice(0, 1)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {mother.fullName}
                                  </p>
                                  <p className="truncate text-xs text-slate-400">
                                    RT {mother.rt}/RW {mother.rw}
                                  </p>
                                </div>
                              </div>
                              <p className="text-right text-sm text-slate-600">
                                {mother.age}
                              </p>
                              <span
                                className={`w-fit justify-self-end rounded-full px-2 py-1 text-xs font-bold ${RISK_STYLE[mother.riskLevel].pill}`}
                              >
                                {mother.riskLevel}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm font-bold text-slate-950">
                          Kategori ibu
                        </p>
                        <div className="mt-7">
                          <Donut pregnant={pregnant} breastfeeding={breastfeeding} />
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-sm font-bold text-slate-950">
                          Tingkat risiko
                        </p>
                        <div className="mt-7">
                          <RiskRows
                            highRisk={highRisk}
                            midRisk={midRisk}
                            lowRisk={lowRisk}
                            total={total}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === "data-ibu" && (
                <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">Daftar ibu</p>
                      <p className="text-xs text-slate-400">
                        Data yang tampil mengikuti filter dan pencarian.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {filtered.length} data
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="min-w-[900px]">
                      <div className="grid grid-cols-[1.5fr_0.5fr_0.85fr_1.1fr_1fr_0.8fr] gap-4 border-b border-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        <span>Nama</span>
                        <span>Umur</span>
                        <span>Kategori</span>
                        <span>Riwayat bayi</span>
                        <span>Kunjungan</span>
                        <span>Risiko</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {filtered.map((mother) => (
                          <div
                            key={mother.id}
                            className="grid grid-cols-[1.5fr_0.5fr_0.85fr_1.1fr_1fr_0.8fr] items-center gap-4 px-5 py-4 text-sm transition hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {mother.fullName}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {mother.village}, RT {mother.rt}/RW {mother.rw}
                              </p>
                            </div>
                            <p className="text-slate-600">{mother.age} th</p>
                            <p className="text-slate-600">
                              {formatCategoryLabel(mother.category)}
                            </p>
                            <p className="text-slate-600">
                              {formatBabyHistoryLabel(mother.babyLossHistory)}
                            </p>
                            <p className="text-slate-600">{mother.lastVisit}</p>
                            <span
                              className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${RISK_STYLE[mother.riskLevel].pill}`}
                            >
                              {formatRiskLabel(mother.riskLevel)}
                            </span>
                          </div>
                        ))}
                        {!filtered.length && (
                          <div className="px-5 py-10 text-center text-sm text-slate-400">
                            Tidak ada data yang cocok.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === "peta" && (
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        Peta wilayah ibu binaan
                      </p>
                      <p className="text-xs text-slate-400">
                        Marker menampilkan posisi relatif dari koordinat data.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {filtered.length || total} titik
                    </span>
                  </div>
                  <MapPanel mothers={filtered.length ? filtered : mothers} />
                </div>
              )}

              {section === "statistik" && (
                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
                    <p className="text-sm font-bold text-slate-950">
                      Audience Age
                    </p>
                    <AgeBars mothers={mothers} />
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
                    <p className="text-sm font-bold text-slate-950">
                      Kategori dan risiko
                    </p>
                    <div className="mt-7 grid gap-8 md:grid-cols-2">
                      <Donut pregnant={pregnant} breastfeeding={breastfeeding} />
                      <RiskRows
                        highRisk={highRisk}
                        midRisk={midRisk}
                        lowRisk={lowRisk}
                        total={total}
                      />
                    </div>
                  </div>
                </div>
              )}

              {section === "riwayat" && (
                <div className="rounded-2xl border border-slate-100 bg-white shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
                  <div className="border-b border-slate-100 p-4">
                    <p className="text-sm font-bold text-slate-950">
                      Log akses admin
                    </p>
                    <p className="text-xs text-slate-400">
                      Riwayat login berhasil dan gagal.
                    </p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {loginHistory.map((item) => (
                      <div
                        key={item.id}
                        className="grid gap-3 px-5 py-4 text-sm transition hover:bg-slate-50 md:grid-cols-[1.5fr_0.75fr_1fr_1fr_0.7fr] md:items-center"
                      >
                        <div>
                          <p className="font-semibold text-slate-950">
                            {item.adminName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {item.adminEmail}
                          </p>
                        </div>
                        <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-600">
                          {item.method === "email" ? "Email" : "QR Code"}
                        </span>
                        <p className="text-slate-600">{item.timestamp}</p>
                        <p className="text-slate-600">{item.device}</p>
                        <span
                          className={`w-fit rounded-full px-2.5 py-1 text-xs font-bold ${
                            item.status === "success"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {item.status === "success" ? "Berhasil" : "Gagal"}
                        </span>
                      </div>
                    ))}
                    {!loginHistory.length && (
                      <div className="px-5 py-10 text-center text-sm text-slate-400">
                        Belum ada riwayat login.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
