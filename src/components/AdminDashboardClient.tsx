"use client";

import { useState, useDeferredValue } from "react";
import type { LoginRecord, MotherProfile } from "@/lib/types";
import { formatCategoryLabel, formatRiskLabel, formatBabyHistoryLabel } from "@/lib/utils";
import MapPanel from "@/components/MapPanel";

type Props = {
  mothers: MotherProfile[];
  loginHistory: LoginRecord[];
};

type Section = "ringkasan" | "data-ibu" | "peta" | "statistik" | "riwayat";

const NAV = [
  { id: "ringkasan",  label: "Ringkasan",      icon: "📊" },
  { id: "data-ibu",  label: "Data Ibu",        icon: "👩‍🤰" },
  { id: "peta",      label: "Peta Wilayah",    icon: "🗺️" },
  { id: "statistik", label: "Statistik",       icon: "📈" },
  { id: "riwayat",   label: "Riwayat Login",   icon: "🔐" },
] as const;

const RISK_STYLE = {
  tinggi: { pill: "bg-rose-50 text-rose-600",   dot: "bg-rose-500",   bar: "bg-rose-500"   },
  sedang: { pill: "bg-amber-50 text-amber-600", dot: "bg-amber-500", bar: "bg-amber-400" },
  rendah: { pill: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", bar: "bg-emerald-500" },
};

// ── Simple SVG Donut ────────────────────────────────────────────────────────
function Donut({ a, b, ca, cb, la, lb }: { a: number; b: number; ca: string; cb: string; la: string; lb: string }) {
  const total = a + b || 1;
  const r = 50; const cx = 60; const cy = 60; const stroke = 18;
  const circ = 2 * Math.PI * r;
  const dashA = (a / total) * circ;
  const dashB = (b / total) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={cb} strokeWidth={stroke}
          strokeDasharray={`${dashB} ${circ}`} strokeDashoffset={0} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={ca} strokeWidth={stroke}
          strokeDasharray={`${dashA} ${circ}`} strokeDashoffset={-dashB} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px" }} />
        <text x={cx} y={cy - 6} textAnchor="middle" className="text-slate-900" fontSize="18" fontWeight="700" fill="#0f172a">{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="9" fill="#94a3b8">Total ibu</text>
      </svg>
      <div className="flex gap-4">
        <span className="flex items-center gap-1.5 text-xs text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ca }} />{la} ({a})</span>
        <span className="flex items-center gap-1.5 text-xs text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: cb }} />{lb} ({b})</span>
      </div>
    </div>
  );
}

export default function AdminDashboardClient({ mothers, loginHistory }: Props) {
  const [section, setSection] = useState<Section>("ringkasan");
  const [query, setQuery]     = useState("");
  const [catF, setCatF]       = useState("semua");
  const [riskF, setRiskF]     = useState("semua");
  const dq = useDeferredValue(query);

  // ── Stats ────────────────────────────────────────────────────────────────
  const total    = mothers.length;
  const hamil    = mothers.filter(m => m.category === "hamil").length;
  const susui    = mothers.filter(m => m.category === "menyusui").length;
  const hiRisk   = mothers.filter(m => m.riskLevel === "tinggi").length;
  const midRisk  = mothers.filter(m => m.riskLevel === "sedang").length;
  const loRisk   = mothers.filter(m => m.riskLevel === "rendah").length;

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = mothers.filter(m => {
    const n = m.fullName.toLowerCase().includes(dq.toLowerCase());
    const c = catF  === "semua" || m.category  === catF;
    const r = riskF === "semua" || m.riskLevel === riskF;
    return n && c && r;
  });

  // ── Age groups ───────────────────────────────────────────────────────────
  const ages = [
    { label: "≤20",  n: mothers.filter(m => m.age <= 20).length },
    { label: "21-25",n: mothers.filter(m => m.age >= 21 && m.age <= 25).length },
    { label: "26-30",n: mothers.filter(m => m.age >= 26 && m.age <= 30).length },
    { label: "31-35",n: mothers.filter(m => m.age >= 31 && m.age <= 35).length },
    { label: ">35",  n: mothers.filter(m => m.age > 35).length },
  ];
  const maxAge = Math.max(...ages.map(a => a.n), 1);

  const cardBase = "rounded-2xl border bg-white shadow-sm p-5";

  return (
    <div className="-mt-6 -mx-4 sm:-mx-6 lg:-mx-8 -mb-12 flex bg-slate-50/60" style={{ minHeight: "calc(100vh - 73px)" }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="flex w-56 flex-shrink-0 flex-col border-r border-slate-200/70 bg-white" style={{ position: "sticky", top: 73, height: "calc(100vh - 73px)", overflowY: "auto" }}>
        {/* Admin badge */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-sm font-bold text-white">A</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">Admin</p>
              <p className="truncate text-xs text-slate-400">Kec. Tegalwaru</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ id, label, icon }) => (
            <button key={id} onClick={() => setSection(id as Section)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                section === id ? "bg-amber-500 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </nav>

        {/* Summary card */}
        <div className="p-4">
          <div className="rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 p-4 text-white">
            <p className="text-xs font-semibold opacity-80">Data aktif</p>
            <p className="mt-1 font-heading text-3xl font-bold">{total}</p>
            <p className="text-xs opacity-75">Ibu binaan Tegalwaru</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
              <div className="rounded-xl bg-white/20 py-1.5">
                <p className="text-lg font-bold">{hamil}</p>
                <p className="text-[10px] opacity-75">Hamil</p>
              </div>
              <div className="rounded-xl bg-white/20 py-1.5">
                <p className="text-lg font-bold">{susui}</p>
                <p className="text-[10px] opacity-75">Menyusui</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-slate-900">
              {NAV.find(n => n.id === section)?.icon}{" "}{NAV.find(n => n.id === section)?.label}
            </h1>
            <p className="text-sm text-slate-400">Kecamatan Tegalwaru, Kab. Purwakarta</p>
          </div>
          <span className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Sistem aktif
          </span>
        </div>

        {/* ════════════════════════ RINGKASAN ════════════════════════════ */}
        {section === "ringkasan" && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[
                { label: "Total Ibu",    value: total,   icon: "👩",  color: "text-slate-900",   bg: "bg-white",        sub: "Data aktif" },
                { label: "Ibu Hamil",   value: hamil,   icon: "🤰",  color: "text-violet-700",  bg: "bg-violet-50/60", sub: `${Math.round(hamil / total * 100)}% dari total` },
                { label: "Menyusui",    value: susui,   icon: "🍼",  color: "text-teal-700",    bg: "bg-teal-50/60",   sub: `${Math.round(susui / total * 100)}% dari total` },
                { label: "Risiko Tinggi",value: hiRisk, icon: "⚠️", color: "text-rose-700",    bg: "bg-rose-50/60",   sub: "Prioritas home visit" },
              ].map(({ label, value, icon, color, bg, sub }) => (
                <div key={label} className={`rounded-2xl border border-white/80 ${bg} p-5 shadow-sm`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                      <p className={`mt-2 font-heading text-4xl font-bold ${color}`}>{value}</p>
                      <p className="mt-1 text-xs text-slate-400">{sub}</p>
                    </div>
                    <span className="text-2xl">{icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Map + recent list */}
            <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
              <div className={cardBase}>
                <div className="mb-3 flex items-center justify-between">
                  <div><p className="section-kicker">Lokasi</p><h2 className="font-heading text-lg font-bold text-slate-900">Distribusi ibu</h2></div>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-400">{total} titik</span>
                </div>
                <MapPanel mothers={mothers} />
              </div>

              <div className={cardBase}>
                <div className="mb-3"><p className="section-kicker">Terbaru</p><h2 className="font-heading text-lg font-bold text-slate-900">Kunjungan terakhir</h2></div>
                <div className="flex flex-col divide-y divide-slate-50">
                  {mothers.slice(0, 6).map(m => {
                    const rs = RISK_STYLE[m.riskLevel];
                    return (
                      <div key={m.id} className="flex items-center gap-3 py-2.5 hover:bg-slate-50/80 transition rounded-xl px-2">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${rs.pill}`}>
                          {m.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{m.fullName}</p>
                          <p className="text-xs text-slate-400">{formatCategoryLabel(m.category)} · {m.lastVisit}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${rs.pill}`}>
                          {m.riskLevel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid gap-5 lg:grid-cols-3">
              {/* Donut: Kategori */}
              <div className={cardBase}>
                <p className="section-kicker">Kategori</p>
                <h2 className="mb-4 font-heading text-base font-bold text-slate-900">Hamil vs Menyusui</h2>
                <Donut a={hamil} b={susui} ca="#7c3aed" cb="#0d9488" la="Hamil" lb="Menyusui" />
              </div>

              {/* Risk bars */}
              <div className={cardBase}>
                <p className="section-kicker">Risiko</p>
                <h2 className="mb-4 font-heading text-base font-bold text-slate-900">Tingkat risiko ibu</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { label: "Rendah", n: loRisk,  bar: "bg-emerald-500", txt: "text-emerald-600" },
                    { label: "Sedang", n: midRisk, bar: "bg-amber-400",   txt: "text-amber-600"   },
                    { label: "Tinggi", n: hiRisk,  bar: "bg-rose-500",    txt: "text-rose-600"    },
                  ].map(({ label, n, bar, txt }) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between">
                        <span className="text-xs font-medium text-slate-600">Risiko {label}</span>
                        <span className={`text-xs font-bold ${txt}`}>{n}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full ${bar} rounded-full`} style={{ width: `${(n / total) * 100}%`, transition: "width 0.8s ease" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Age bar chart */}
              <div className={cardBase}>
                <p className="section-kicker">Demografi</p>
                <h2 className="mb-4 font-heading text-base font-bold text-slate-900">Kelompok umur</h2>
                <div className="flex h-32 items-end gap-2">
                  {ages.map(({ label, n }) => (
                    <div key={label} className="flex flex-1 flex-col items-center gap-1">
                      <span className="text-xs font-bold text-slate-700">{n}</span>
                      <div className="w-full rounded-t-lg bg-amber-400" style={{ height: `${(n / maxAge) * 80}px`, transition: "height 0.7s ease" }} />
                      <span className="text-[10px] leading-tight text-slate-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════ DATA IBU ═════════════════════════════ */}
        {section === "data-ibu" && (
          <>
            {/* Filter bar */}
            <div className={`${cardBase} grid gap-3 sm:grid-cols-3`}>
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Cari nama ibu…"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:bg-white" />
              <select value={catF} onChange={e => setCatF(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:bg-white">
                <option value="semua">Semua kategori</option>
                <option value="hamil">Ibu hamil</option>
                <option value="menyusui">Ibu menyusui</option>
              </select>
              <select value={riskF} onChange={e => setRiskF(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:bg-white">
                <option value="semua">Semua risiko</option>
                <option value="rendah">Risiko rendah</option>
                <option value="sedang">Risiko sedang</option>
                <option value="tinggi">Risiko tinggi</option>
              </select>
            </div>

            {/* Table */}
            <div className={`${cardBase} overflow-hidden !p-0`}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="font-heading text-lg font-bold text-slate-900">Data ibu</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{filtered.length} data</span>
              </div>
              <div className="hidden grid-cols-[2fr_0.5fr_0.7fr_1fr_0.9fr_0.6fr] gap-4 border-b border-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 sm:grid">
                <span>Nama / Alamat</span><span>Umur</span><span>Kategori</span><span>Riwayat bayi</span><span>Kunjungan</span><span>Risiko</span>
              </div>
              <div className="divide-y divide-slate-50">
                {filtered.map(m => {
                  const rs = RISK_STYLE[m.riskLevel];
                  return (
                    <div key={m.id} className="grid gap-2 px-5 py-3.5 transition hover:bg-slate-50 sm:grid-cols-[2fr_0.5fr_0.7fr_1fr_0.9fr_0.6fr] sm:items-center">
                      <div>
                        <p className="font-semibold text-slate-900">{m.fullName}</p>
                        <p className="text-xs text-slate-400">RT {m.rt}/RW {m.rw} · {m.village}</p>
                      </div>
                      <p className="text-sm text-slate-600">{m.age} th</p>
                      <span className="w-fit rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">{formatCategoryLabel(m.category)}</span>
                      <p className="text-xs text-slate-600">{formatBabyHistoryLabel(m.babyLossHistory)}</p>
                      <p className="text-xs text-slate-600">{m.lastVisit}</p>
                      <span className={`w-fit rounded-full px-2 py-0.5 text-xs font-semibold ${rs.pill}`}>{m.riskLevel}</span>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="px-5 py-10 text-center text-sm text-slate-400">Tidak ada data yang cocok.</div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════ PETA ═════════════════════════════════ */}
        {section === "peta" && (
          <div className={cardBase}>
            <div className="mb-4"><p className="section-kicker">Distribusi</p><h2 className="font-heading text-xl font-bold text-slate-900">Peta lokasi ibu binaan</h2><p className="mt-1 text-sm text-slate-400">Marker menampilkan posisi relatif berdasarkan koordinat GPS.</p></div>
            <MapPanel mothers={mothers} />
          </div>
        )}

        {/* ════════════════════════ STATISTIK ════════════════════════════ */}
        {section === "statistik" && (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className={cardBase}>
              <p className="section-kicker">Kategori</p><h2 className="mb-5 font-heading text-lg font-bold text-slate-900">Hamil vs Menyusui</h2>
              <Donut a={hamil} b={susui} ca="#7c3aed" cb="#0d9488" la="Hamil" lb="Menyusui" />
            </div>
            <div className={cardBase}>
              <p className="section-kicker">Risiko</p><h2 className="mb-5 font-heading text-lg font-bold text-slate-900">Distribusi tingkat risiko</h2>
              <div className="flex flex-col gap-5">
                {[
                  { label: "Risiko Rendah", n: loRisk,  bar: "bg-emerald-500", txt: "text-emerald-700", bg: "bg-emerald-50" },
                  { label: "Risiko Sedang", n: midRisk, bar: "bg-amber-400",   txt: "text-amber-700",   bg: "bg-amber-50"   },
                  { label: "Risiko Tinggi", n: hiRisk,  bar: "bg-rose-500",    txt: "text-rose-700",    bg: "bg-rose-50"    },
                ].map(({ label, n, bar, txt, bg }) => (
                  <div key={label} className={`rounded-2xl ${bg} p-4`}>
                    <div className="mb-2 flex justify-between">
                      <span className={`font-semibold ${txt}`}>{label}</span>
                      <span className={`font-heading text-2xl font-bold ${txt}`}>{n}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/70">
                      <div className={`h-full ${bar} rounded-full`} style={{ width: `${(n / total) * 100}%` }} />
                    </div>
                    <p className="mt-1 text-xs opacity-60">{Math.round((n / total) * 100)}% dari total ibu</p>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${cardBase} lg:col-span-2`}>
              <p className="section-kicker">Demografi</p><h2 className="mb-5 font-heading text-lg font-bold text-slate-900">Distribusi kelompok umur</h2>
              <div className="flex h-40 items-end gap-4">
                {ages.map(({ label, n }) => (
                  <div key={label} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{n}</span>
                    <div className="w-full rounded-t-xl bg-gradient-to-t from-amber-500 to-amber-300" style={{ height: `${(n / maxAge) * 110}px` }} />
                    <span className="text-xs text-slate-500">{label} th</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════ RIWAYAT LOGIN ════════════════════════ */}
        {section === "riwayat" && (
          <div className={`${cardBase} !p-0 overflow-hidden`}>
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-heading text-lg font-bold text-slate-900">Log akses admin</h2>
              <p className="text-sm text-slate-400">Riwayat login berhasil dan gagal</p>
            </div>
            <div className="hidden grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] gap-4 border-b border-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 sm:grid">
              <span>Admin</span><span>Metode</span><span>Waktu</span><span>Perangkat</span><span>Status</span>
            </div>
            <div className="divide-y divide-slate-50">
              {loginHistory.map((l, i) => (
                <div key={l.id} className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[2fr_1fr_0.8fr_1fr_0.7fr] sm:items-center"
                  style={{ animationDelay: `${i * 40}ms` }}>
                  <div>
                    <p className="font-semibold text-slate-900">{l.adminName}</p>
                    <p className="text-xs text-slate-400">{l.adminEmail}</p>
                  </div>
                  <span className="w-fit rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">{l.method === "email" ? "📧 Email" : "📱 QR Code"}</span>
                  <p className="text-xs text-slate-600">{l.timestamp}</p>
                  <p className="text-xs text-slate-600">{l.device}</p>
                  <span className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                    {l.status === "success" ? "✓ Berhasil" : "✕ Gagal"}
                  </span>
                </div>
              ))}
              {loginHistory.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-400">Belum ada riwayat login.</div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
