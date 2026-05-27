"use client";

import {
  useDeferredValue,
  useMemo,
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";
import type {
  BabyLossHistory,
  LoginRecord,
  MotherCategory,
  MotherProfile,
  RiskLevel,
} from "@/lib/types";
import {
  deriveRiskLevel,
  formatBabyHistoryLabel,
  formatCategoryLabel,
  formatRiskLabel,
} from "@/lib/utils";
import MapCard from "@/components/MapCard";
import QrBadge from "@/components/QrBadge";

type Props = {
  currentAdmin: AdminSession;
  currentAdminQrToken?: string;
  mothers: MotherProfile[];
  loginHistory: LoginRecord[];
};

type Section =
  | "ringkasan"
  | "data-ibu"
  | "tambah-data"
  | "peta"
  | "statistik"
  | "riwayat";

const NAV = [
  { id: "ringkasan", label: "Ringkasan", icon: "grid" },
  { id: "data-ibu", label: "Data Ibu", icon: "users" },
  { id: "tambah-data", label: "Tambah Data", icon: "plus" },
  { id: "peta", label: "Peta Wilayah", icon: "map" },
  { id: "statistik", label: "Statistik", icon: "chart" },
  { id: "riwayat", label: "Riwayat Login", icon: "clock" },
] as const;

type MotherFormState = {
  fullName: string;
  age: string;
  category: MotherCategory;
  babyLossHistory: BabyLossHistory;
  address: string;
  village: string;
  rt: string;
  rw: string;
  latitude: string;
  longitude: string;
  lastVisit: string;
  notes: string;
  gestationalAgeWeeks: string;
  childAgeMonths: string;
};

const INITIAL_FORM: MotherFormState = {
  fullName: "",
  age: "",
  category: "hamil",
  babyLossHistory: "tidak_ada",
  address: "",
  village: "",
  rt: "",
  rw: "",
  latitude: "",
  longitude: "",
  lastVisit: "",
  notes: "",
  gestationalAgeWeeks: "",
  childAgeMonths: "",
};

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

  if (name === "plus") {
    return (
      <svg {...common}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
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
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    teal: "bg-teal-50 text-teal-700 ring-teal-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100",
  };

  return (
    <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div
        className={`mb-7 flex h-10 w-10 items-center justify-center rounded-full ring-1 ${tones[tone]}`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
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
          <span className="text-xs text-slate-500">{item.label}</span>
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

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
      {label}
      {children}
      {helper ? <span className="text-xs font-normal text-slate-500">{helper}</span> : null}
    </label>
  );
}

const inputClass =
  "rounded-2xl border border-slate-200/80 bg-white px-4 py-3 font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-amber-300 focus:ring-4 focus:ring-amber-100/70";

export default function AdminDashboardClient({
  currentAdmin,
  currentAdminQrToken,
  mothers,
  loginHistory,
}: Props) {
  const router = useRouter();
  const [motherData, setMotherData] = useState(mothers);
  const [section, setSection] = useState<Section>("ringkasan");
  const [query, setQuery] = useState("");
  const [catF, setCatF] = useState("semua");
  const [riskF, setRiskF] = useState("semua");
  const [form, setForm] = useState<MotherFormState>(INITIAL_FORM);
  const [formMessage, setFormMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedQrMother, setSelectedQrMother] = useState<MotherProfile | null>(null);
  const deferredQuery = useDeferredValue(query);
  
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close profile menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }

    function handleEscKey(event: KeyboardEvent) {
      if (profileOpen && event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [profileOpen]);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  function updateForm<K extends keyof MotherFormState>(
    key: K,
    value: MotherFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setFormMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const age = Number(form.age);
    const gestationalAgeWeeks = Number(form.gestationalAgeWeeks);
    const childAgeMonths = Number(form.childAgeMonths);
    const latitude = Number(form.latitude);
    const longitude = Number(form.longitude);

    if (!form.fullName.trim() || !form.address.trim() || !form.village.trim()) {
      setFormMessage("Nama, alamat, dan desa/kelurahan wajib diisi.");
      return;
    }

    if (!Number.isFinite(age) || age < 10 || age > 60) {
      setFormMessage("Umur ibu harus diisi antara 10 sampai 60 tahun.");
      return;
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      setFormMessage("Latitude harus diisi dengan angka antara -90 sampai 90.");
      return;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setFormMessage("Longitude harus diisi dengan angka antara -180 sampai 180.");
      return;
    }

    if (
      form.category === "hamil" &&
      (!Number.isFinite(gestationalAgeWeeks) || gestationalAgeWeeks < 1 || gestationalAgeWeeks > 42)
    ) {
      setFormMessage("Usia kehamilan harus diisi antara 1 sampai 42 minggu.");
      return;
    }

    if (
      form.category === "menyusui" &&
      (!Number.isFinite(childAgeMonths) || childAgeMonths < 0 || childAgeMonths > 24)
    ) {
      setFormMessage("Usia anak harus diisi antara 0 sampai 24 bulan.");
      return;
    }

    setFormMessage("Menyimpan data ibu...");

    try {
      const response = await fetch("/api/mothers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          age,
          category: form.category,
          babyLossHistory: form.babyLossHistory,
          address: form.address.trim(),
          village: form.village.trim(),
          rt: form.rt.trim() || "-",
          rw: form.rw.trim() || "-",
          latitude,
          longitude,
          lastVisit: form.lastVisit,
          notes: form.notes.trim() || "Belum ada catatan tambahan.",
          gestationalAgeWeeks: form.category === "hamil" ? gestationalAgeWeeks : undefined,
          childAgeMonths: form.category === "menyusui" ? childAgeMonths : undefined,
        }),
      });
      const data = (await response.json()) as { mother?: MotherProfile; message?: string };

      if (!response.ok || !data.mother) {
        setFormMessage(data.message ?? "Data ibu gagal disimpan.");
        return;
      }

      setMotherData((current) => [data.mother!, ...current]);
      setForm(INITIAL_FORM);
      setFormMessage(`Data ${data.mother.fullName} berhasil disimpan ke database.`);
      router.refresh();
    } catch {
      setFormMessage("Data ibu gagal disimpan karena koneksi server bermasalah.");
    }
  }

  const total = motherData.length;
  const pregnant = motherData.filter((item) => item.category === "hamil").length;
  const breastfeeding = motherData.filter((item) => item.category === "menyusui").length;
  const highRisk = motherData.filter((item) => item.riskLevel === "tinggi").length;
  const midRisk = motherData.filter((item) => item.riskLevel === "sedang").length;
  const lowRisk = motherData.filter((item) => item.riskLevel === "rendah").length;

  const filtered = useMemo(
    () =>
      motherData.filter((mother) => {
        const keyword = deferredQuery.toLowerCase();
        const matchesQuery =
          mother.fullName.toLowerCase().includes(keyword) ||
          mother.village.toLowerCase().includes(keyword) ||
          mother.address.toLowerCase().includes(keyword);
        const matchesCategory = catF === "semua" || mother.category === catF;
        const matchesRisk = riskF === "semua" || mother.riskLevel === riskF;

        return matchesQuery && matchesCategory && matchesRisk;
      }),
    [catF, deferredQuery, motherData, riskF],
  );

  const topVillage = useMemo(() => {
    const counts = new Map<string, number>();
    motherData.forEach((mother) => {
      counts.set(mother.village, (counts.get(mother.village) ?? 0) + 1);
    });

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  }, [motherData]);

  const activeTitle = NAV.find((item) => item.id === section)?.label ?? "Ringkasan";
  const recent = motherData.slice(0, 5);

    return (
      <>
      <div className="mx-auto flex h-screen w-full max-w-[1800px] overflow-hidden rounded-none border border-white/80 bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
        <aside className="hidden w-[292px] shrink-0 border-r border-slate-200/70 bg-[#fffdf8] lg:flex lg:flex-col">
          <div className="border-b border-slate-100 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-white p-3 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white shadow-[0_10px_22px_rgba(245,158,11,0.22)]">
                BC
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950">
                  {currentAdmin.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {currentAdmin.region}
                </p>
              </div>
              <Icon name="chevron" className="h-4 w-4 text-slate-300" />
            </div>
          </div>

          <div className="border-b border-slate-100 p-4">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-3 py-2.5 text-sm text-slate-400 shadow-sm">
              <Icon name="search" className="h-4 w-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Cari nama atau desa..."
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
                    : "text-slate-500 hover:bg-amber-50 hover:text-slate-800"
                }`}
              >
                <Icon name={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#faf7f0]">
          <header className="flex flex-col gap-4 border-b border-slate-200/70 bg-white px-4 py-4 sm:px-6 xl:flex-row xl:items-center xl:justify-between">
            <label className="flex max-w-xl flex-1 items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-4 text-slate-400 transition focus-within:border-amber-300 focus-within:bg-white focus-within:shadow-sm">
              <Icon name="search" className="h-5 w-5 shrink-0" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-2.5 text-base text-slate-700 outline-none placeholder:text-slate-400"
                placeholder="Cari nama ibu, desa, atau alamat"
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
              <div className="relative flex items-center gap-3 rounded-[1.35rem] border border-slate-100 bg-white px-3 py-2 shadow-sm">
                <button
                  ref={profileButtonRef}
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex items-center gap-3 rounded-2xl px-1 py-1 text-left transition hover:bg-slate-50"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700 ring-1 ring-amber-200/70">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950">
                      {currentAdmin.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {currentAdmin.email}
                    </p>
                  </div>
                  <Icon
                    name="chevron"
                    className={`h-4 w-4 shrink-0 text-slate-300 transition ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={logout}
                  disabled={loggingOut}
                  className="rounded-full border border-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:border-rose-100 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60"
                >
                  {loggingOut ? "Keluar..." : "Keluar"}
                </button>
                
                {/* QR Menu - positioned relative to parent container, with higher z-index */}
                {currentAdminQrToken && (
                  <div
                    ref={profileMenuRef}
                    className={`absolute right-0 top-[calc(100%+0.75rem)] z-[100] w-80 origin-top-right rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.2)] transition-all duration-200 ${
                      profileOpen
                        ? "scale-100 opacity-100 visible"
                        : "scale-95 opacity-0 invisible pointer-events-none"
                    }`}
                    role="menu"
                    style={{ isolation: "isolate" }}
                  >
                    <div className="mb-4 border-b border-slate-100 pb-3">
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                        QR Login Admin
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-950">
                        {currentAdmin.name}
                      </p>
                      <p className="text-xs text-slate-500">{currentAdmin.email}</p>
                    </div>
                    <div className="flex justify-center">
                      <QrBadge
                        value={currentAdminQrToken}
                        size={200}
                        downloadName={`qr-login-${currentAdmin.email}.png`}
                        showDownload
                      />
                    </div>
                    <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                      Tunjukkan QR ini saat login dengan kamera. QR ini bersifat rahasia.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="min-w-0 flex-1 overflow-y-auto">
            <section className="border-b border-slate-100 bg-white px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-white shadow-[0_10px_22px_rgba(245,158,11,0.24)]">
                    B
                  </div>
                  <div>
                    <h1 className="font-heading text-2xl font-bold text-slate-950">
                      Dashboard Pemantauan Ibu
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                      Lihat data penting, ibu yang perlu didahulukan, dan sebaran wilayah dalam satu tampilan yang ringkas.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  <span>Status</span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-emerald-600">
                    Aktif
                  </span>
                  <span>Wilayah</span>
                  <span className="font-semibold text-slate-900">
                    Kecamatan Tegalwaru
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl bg-slate-50 p-1">
                {NAV.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                      section === item.id
                        ? "bg-white text-slate-950 shadow-sm"
                        : "text-slate-500 hover:bg-white/70 hover:text-slate-800"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="p-4 sm:p-6">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700/80">
                    {activeTitle}
                  </p>
                  <h2 className="mt-1 font-heading text-xl font-bold text-slate-950">
                    Informasi yang paling perlu dilihat
                  </h2>
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

                  <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <div className="grid gap-5 xl:grid-cols-[220px_1fr]">
                      <div className="flex flex-col justify-between gap-6">
                        <div>
                          <p className="text-sm font-medium text-slate-500">Desa dengan data terbanyak</p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            {topVillage?.[0] ?? "Tegalwaru"}
                          </p>
                          <p className="mt-5 text-sm font-medium text-slate-500">Data sesuai pencarian</p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            {filtered.length} ibu
                          </p>
                          <p className="mt-5 text-sm font-medium text-slate-500">Periode pantauan</p>
                          <p className="mt-1 text-2xl font-bold text-slate-950">
                            Bulan ini
                          </p>
                        </div>
                        <button className="flex items-center gap-2 text-sm font-bold text-amber-700">
                          <Icon name="refresh" className="h-4 w-4" />
                          Refresh data
                        </button>
                      </div>
                      <div className="[&>div]:h-full [&>div]:min-h-[360px] [&>div]:border-slate-100 [&>div]:bg-slate-50 [&_[aria-label]]:h-[360px]">
                        <MapCard mothers={motherData} />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.35rem] border border-slate-200/70 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)] xl:col-span-2">
                    <div className="grid divide-y divide-slate-100 xl:grid-cols-[1fr_1fr_1fr] xl:divide-x xl:divide-y-0">
                      <div className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-slate-950">
                              Ibu prioritas
                            </p>
                          <p className="text-xs text-slate-500">
                            Untuk dilihat lebih dulu
                          </p>
                          </div>
                          <span className="text-xs font-bold text-amber-700">
                            Prioritas
                          </span>
                        </div>
                        <div className="space-y-3">
                          {recent.map((mother) => (
                            <div
                              key={mother.id}
                              className="grid grid-cols-[1fr_58px_92px] items-center gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                  {mother.fullName.slice(0, 1)}
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {mother.fullName}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">
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
                                {formatRiskLabel(mother.riskLevel)}
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
                          Log akses terbaru
                        </p>
                        <p className="text-xs text-slate-500">
                          Informasi audit login admin terakhir
                        </p>
                        <div className="mt-4 space-y-3">
                          {loginHistory.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {item.adminName}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">
                                    {item.adminEmail}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${
                                    item.status === "success"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  {item.status === "success" ? "Berhasil" : "Gagal"}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                <span>{item.method === "email" ? "Email" : "QR Code"}</span>
                                <span>{item.timestamp}</span>
                                <span>{item.device}</span>
                              </div>
                            </div>
                          ))}
                          {!loginHistory.length && (
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center text-sm text-slate-500">
                              Belum ada riwayat login.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === "data-ibu" && (
                <div className="rounded-[1.35rem] border border-slate-200/70 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <div className="flex flex-col gap-2 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">Daftar ibu</p>
                        <p className="text-xs text-slate-500">
                          Data yang tampil mengikuti filter dan pencarian.
                        </p>
                    </div>
                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {filtered.length} data
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                      <div className="min-w-[1020px]">
                      <div className="grid grid-cols-[1.5fr_0.5fr_0.85fr_1.1fr_1fr_0.8fr_0.65fr] gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        <span>Nama</span>
                        <span>Umur</span>
                        <span>Kategori</span>
                        <span>Riwayat bayi</span>
                        <span>Kunjungan</span>
                        <span>Risiko</span>
                        <span>QR</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {filtered.map((mother) => (
                          <div
                            key={mother.id}
                            className="grid grid-cols-[1.5fr_0.5fr_0.85fr_1.1fr_1fr_0.8fr_0.65fr] items-center gap-4 px-5 py-4 text-sm transition hover:bg-slate-50"
                          >
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">
                                {mother.fullName}
                              </p>
                              <p className="truncate text-xs text-slate-500">
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
                            <button
                              type="button"
                              onClick={() => setSelectedQrMother(mother)}
                              className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                            >
                              Lihat QR
                            </button>
                          </div>
                        ))}
                        {!filtered.length && (
                            <div className="px-5 py-10 text-center text-sm text-slate-500">
                              Tidak ada data yang cocok.
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {section === "peta" && (
                <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-950">
                        Peta wilayah ibu binaan
                      </p>
                      <p className="text-xs text-slate-500">
                        Titik pada peta membantu melihat sebaran ibu binaan per wilayah.
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      {filtered.length || total} titik
                    </span>
                  </div>
                  <MapCard mothers={filtered.length ? filtered : motherData} />
                </div>
              )}

              {section === "statistik" && (
                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <p className="text-sm font-bold text-slate-950">
                      Sebaran umur ibu
                    </p>
                    <AgeBars mothers={mothers} />
                  </div>
                  <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
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
              
              {section === "tambah-data" && (
                <div className="grid gap-4 xl:grid-cols-[1.45fr_0.8fr]">
                  <form
                    onSubmit={handleSubmit}
                    className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
                  >
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-950">
                          Form input data ibu
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          Isi data dasar untuk menambahkan ibu binaan baru ke dashboard.
                        </p>
                      </div>
                      <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        QR otomatis
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Nama lengkap">
                        <input
                          value={form.fullName}
                          onChange={(event) => updateForm("fullName", event.target.value)}
                          className={inputClass}
                          placeholder="Contoh: Siti Aminah"
                        />
                      </Field>
                      <Field label="Umur ibu">
                        <input
                          value={form.age}
                          onChange={(event) => updateForm("age", event.target.value)}
                          className={inputClass}
                          inputMode="numeric"
                          placeholder="Contoh: 28"
                        />
                      </Field>
                      <Field label="Kategori">
                        <select
                          value={form.category}
                          onChange={(event) => updateForm("category", event.target.value as MotherCategory)}
                          className={inputClass}
                        >
                          <option value="hamil">Ibu hamil</option>
                          <option value="menyusui">Ibu menyusui</option>
                        </select>
                      </Field>
                      <Field label="Riwayat bayi">
                        <select
                          value={form.babyLossHistory}
                          onChange={(event) => updateForm("babyLossHistory", event.target.value as BabyLossHistory)}
                          className={inputClass}
                        >
                          <option value="tidak_ada">Tidak ada</option>
                          <option value="keguguran">Keguguran</option>
                          <option value="bayi_<3_bulan">Bayi meninggal &lt; 3 bulan</option>
                          <option value="bayi_<1_tahun">Bayi meninggal &lt; 1 tahun</option>
                        </select>
                      </Field>
                      <Field label="Desa/Kelurahan">
                        <input
                          value={form.village}
                          onChange={(event) => updateForm("village", event.target.value)}
                          className={inputClass}
                          placeholder="Kelurahan Sukamaju"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="RT">
                          <input
                            value={form.rt}
                            onChange={(event) => updateForm("rt", event.target.value)}
                            className={inputClass}
                            placeholder="03"
                          />
                        </Field>
                        <Field label="RW">
                          <input
                            value={form.rw}
                            onChange={(event) => updateForm("rw", event.target.value)}
                            className={inputClass}
                            placeholder="05"
                          />
                        </Field>
                      </div>
                      <Field label="Alamat" helper="Tuliskan alamat singkat yang mudah dicari.">
                        <textarea
                          value={form.address}
                          onChange={(event) => updateForm("address", event.target.value)}
                          className={`${inputClass} min-h-28 resize-none`}
                          placeholder="Jl. Melati No. 8"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Latitude" helper="Contoh: -6.6716735">
                          <input
                            value={form.latitude}
                            onChange={(event) => updateForm("latitude", event.target.value)}
                            className={inputClass}
                            inputMode="decimal"
                            placeholder="-6.6716735"
                          />
                        </Field>
                        <Field label="Longitude" helper="Contoh: 107.3568055">
                          <input
                            value={form.longitude}
                            onChange={(event) => updateForm("longitude", event.target.value)}
                            className={inputClass}
                            inputMode="decimal"
                            placeholder="107.3568055"
                          />
                        </Field>
                      </div>
                      <Field label={form.category === "hamil" ? "Usia kehamilan" : "Usia anak"} helper={form.category === "hamil" ? "Dalam minggu." : "Dalam bulan."}>
                        <input
                          value={form.category === "hamil" ? form.gestationalAgeWeeks : form.childAgeMonths}
                          onChange={(event) =>
                            updateForm(
                              form.category === "hamil" ? "gestationalAgeWeeks" : "childAgeMonths",
                              event.target.value,
                            )
                          }
                          className={inputClass}
                          inputMode="numeric"
                          placeholder={form.category === "hamil" ? "24" : "6"}
                        />
                      </Field>
                      <Field label="Tanggal kunjungan terakhir" helper="Opsional. Jika kosong memakai tanggal hari ini.">
                        <input
                          type="date"
                          value={form.lastVisit}
                          onChange={(event) => updateForm("lastVisit", event.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <Field label="Catatan" helper="Opsional, misalnya kondisi kesehatan atau tindak lanjut.">
                        <textarea
                          value={form.notes}
                          onChange={(event) => updateForm("notes", event.target.value)}
                          className={`${inputClass} min-h-28 resize-none`}
                          placeholder="Perlu kunjungan rumah rutin..."
                        />
                      </Field>
                    </div>

                    {formMessage ? (
                      <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                        {formMessage}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          setForm(INITIAL_FORM);
                          setFormMessage("");
                        }}
                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                      >
                        Reset
                      </button>
                      <button
                        type="submit"
                        className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-[0_12px_24px_rgba(245,158,11,0.22)] transition hover:bg-amber-600"
                      >
                        Simpan data ibu
                      </button>
                    </div>
                  </form>

                  <div className="rounded-[1.35rem] border border-slate-200/70 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                    <p className="text-sm font-bold text-slate-950">Preview data</p>
                    <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm text-slate-700">
                      <p className="font-heading text-xl font-bold text-slate-950">
                        {form.fullName || "Nama ibu"}
                      </p>
                      <p className="mt-1 text-slate-500">
                        {formatCategoryLabel(form.category)} · {form.age || "-"} tahun
                      </p>
                      <div className="mt-4 grid gap-2 text-xs font-semibold text-slate-600">
                        <span>Wilayah: {form.village || "Belum diisi"}</span>
                        <span>RT/RW: {form.rt || "-"}/{form.rw || "-"}</span>
                        <span>Koordinat: {form.latitude || "-"}, {form.longitude || "-"}</span>
                        <span>Riwayat: {formatBabyHistoryLabel(form.babyLossHistory)}</span>
                        <span>
                          Risiko estimasi: {form.age ? formatRiskLabel(deriveRiskLevel({ age: Number(form.age), babyLossHistory: form.babyLossHistory })) : "-"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Data yang disimpan akan langsung muncul di daftar ibu dan memengaruhi ringkasan dashboard pada sesi ini.
                    </p>
                  </div>
                </div>
              )}

              {section === "riwayat" && (
                <div className="rounded-[1.35rem] border border-slate-200/70 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <div className="border-b border-slate-100 p-4">
                    <p className="text-sm font-bold text-slate-950">
                      Log akses admin
                    </p>
                      <p className="text-xs text-slate-500">
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
                          <p className="text-xs text-slate-500">
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
                      <div className="px-5 py-10 text-center text-sm text-slate-500">
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
      {selectedQrMother ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-white/80 bg-white p-6 text-center shadow-[0_28px_70px_rgba(15,23,42,0.25)]">
            <div className="flex items-start justify-between gap-4 text-left">
              <div>
                <p className="section-kicker">QR ibu</p>
                <h2 className="mt-2 font-heading text-2xl font-bold text-slate-950">
                  {selectedQrMother.fullName}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {formatCategoryLabel(selectedQrMother.category)} - {selectedQrMother.village}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQrMother(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-xl leading-none text-slate-500 transition hover:bg-slate-50"
                aria-label="Tutup QR ibu"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex justify-center">
              <QrBadge
                value={selectedQrMother.qrCode}
                size={220}
                showDownload
                downloadName={`qr-ibu-${selectedQrMother.fullName.toLowerCase().replace(/\s+/g, "-")}.png`}
              />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Kode unik
              </p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-slate-800">
                {selectedQrMother.qrCode}
              </p>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-500">
              QR ini bisa discan di halaman Cek Data untuk menampilkan data ibu.
            </p>
          </div>
        </div>
      ) : null}
      </>
   
  );
}
