"use client";

import { useState, useRef, useEffect } from "react";
import QrBadge from "@/components/QrBadge";
import type { MotherProfile } from "@/lib/types";
import {
  formatBabyHistoryLabel,
  formatCategoryLabel,
  formatRiskLabel,
} from "@/lib/utils";

type CekDataClientProps = {
  mothers: MotherProfile[];
};

type ScanStep = "idle" | "scanning" | "found" | "not_found";

const RISK_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  tinggi: {
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  sedang: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  rendah: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
};

const CATEGORY_COLORS: Record<string, { badge: string }> = {
  hamil: { badge: "bg-violet-100 text-violet-700" },
  menyusui: { badge: "bg-teal-100 text-teal-700" },
};

function ScannerFrame({ scanning }: { scanning: boolean }) {
  return (
    <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
      {/* Corner marks */}
      {[
        "top-0 left-0 border-t-4 border-l-4 rounded-tl-2xl",
        "top-0 right-0 border-t-4 border-r-4 rounded-tr-2xl",
        "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-2xl",
        "bottom-0 right-0 border-b-4 border-r-4 rounded-br-2xl",
      ].map((cls, i) => (
        <div
          key={i}
          className={`absolute h-10 w-10 transition-colors duration-300 ${cls} ${
            scanning ? "border-amber-400" : "border-slate-300"
          }`}
        />
      ))}

      {/* Camera placeholder */}
      <div className="absolute inset-4 overflow-hidden rounded-xl bg-slate-900/5 backdrop-blur-sm">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,116,139,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,0.5) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Scan line animation */}
        {scanning && (
          <div className="scan-line absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />
        )}

        {/* Center icon */}
        <div className="flex h-full flex-col items-center justify-center gap-3">
          {scanning ? (
            <>
              <div className="relative">
                <svg
                  className="h-12 w-12 animate-pulse text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75V16.5zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75V13.5zM13.5 19.5h.75v.75h-.75V19.5zM19.5 13.5h.75v.75h-.75V13.5zM19.5 19.5h.75v.75h-.75V19.5zM16.5 16.5h.75v.75h-.75V16.5z"
                  />
                </svg>
                <span className="absolute -right-1 -top-1 h-3 w-3 animate-ping rounded-full bg-amber-400" />
              </div>
              <p className="text-xs font-semibold tracking-wide text-amber-600">
                Memindai…
              </p>
            </>
          ) : (
            <>
              <svg
                className="h-12 w-12 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                />
              </svg>
              <p className="text-xs font-medium text-slate-400">
                Kamera siap
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MotherCard({ mother }: { mother: MotherProfile }) {
  const risk = RISK_COLORS[mother.riskLevel] ?? RISK_COLORS.rendah;
  const cat = CATEGORY_COLORS[mother.category] ?? CATEGORY_COLORS.hamil;

  const infoRows = [
    { label: "Kategori", value: formatCategoryLabel(mother.category) },
    { label: "Umur", value: `${mother.age} tahun` },
    {
      label: "Usia kehamilan",
      value:
        mother.gestationalAgeWeeks != null
          ? `${mother.gestationalAgeWeeks} minggu`
          : mother.childAgeMonths != null
          ? `Bayi ${mother.childAgeMonths} bulan`
          : "—",
    },
    { label: "Alamat", value: `${mother.address}, RT ${mother.rt}/RW ${mother.rw}` },
    { label: "Desa", value: mother.village },
    { label: "Riwayat bayi", value: formatBabyHistoryLabel(mother.babyLossHistory) },
    { label: "Kunjungan terakhir", value: mother.lastVisit },
  ];

  return (
    <div className="card-appear flex flex-col gap-6">
      {/* Header */}
      <div
        className={`flex items-start justify-between gap-4 rounded-2xl border p-5 ${risk.bg}`}
      >
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm ring-2 ring-white">
            <svg
              className="h-7 w-7 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div>
            <p className="font-heading text-xl font-bold text-slate-900">
              {mother.fullName}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <span
                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${cat.badge}`}
              >
                {formatCategoryLabel(mother.category)}
              </span>
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-semibold ${risk.text} bg-white/70`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${risk.dot}`} />
                {formatRiskLabel(mother.riskLevel)}
              </span>
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="flex-shrink-0">
          <QrBadge value={mother.qrCode} size={80} />
        </div>
      </div>

      {/* Info grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        {infoRows.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-100 bg-white px-4 py-3"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              {label}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {/* Notes */}
      {mother.notes && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Catatan kader
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            {mother.notes}
          </p>
        </div>
      )}
    </div>
  );
}

export default function CekDataClient({ mothers }: CekDataClientProps) {
  const [step, setStep] = useState<ScanStep>("idle");
  const [manualCode, setManualCode] = useState("");
  const [found, setFound] = useState<MotherProfile | null>(null);
  const [inputMode, setInputMode] = useState<"scan" | "manual">("scan");
  const [error, setError] = useState("");
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pick random QR codes for demo quick-select
  const demoMothers = mothers.slice(0, 3);

  function resetState() {
    setStep("idle");
    setFound(null);
    setError("");
    setManualCode("");
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
  }

  function simulateScan(qrCode?: string) {
    setStep("scanning");
    setError("");
    setFound(null);

    scanTimerRef.current = setTimeout(() => {
      const code = qrCode ?? demoMothers[Math.floor(Math.random() * demoMothers.length)]?.qrCode ?? "";
      const result = mothers.find((m) => m.qrCode === code);
      if (result) {
        setFound(result);
        setStep("found");
      } else {
        setStep("not_found");
      }
    }, 2200);
  }

  function submitManual() {
    const code = manualCode.trim().toUpperCase();
    if (!code) {
      setError("Masukkan kode QR terlebih dahulu.");
      return;
    }
    const result = mothers.find((m) => m.qrCode === code);
    if (result) {
      setFound(result);
      setStep("found");
      setError("");
    } else {
      setError(`Kode "${code}" tidak ditemukan. Periksa kembali kartu QR Anda.`);
      setStep("not_found");
    }
  }

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
    };
  }, []);

  return (
    <>
      <style>{`
        @keyframes scanMove {
          0%   { top: 12px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 14px); opacity: 0; }
        }
        .scan-line { animation: scanMove 1.6s ease-in-out infinite; }
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-appear { animation: cardAppear 0.45s ease both; }
      `}</style>

      <div className="flex flex-col gap-8">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="surface-card-strong rounded-[2rem] p-6 sm:p-10">
          <p className="section-kicker">Portal ibu</p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-slate-900 sm:text-5xl">
            Cek data kesehatan Anda.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Scan QR Code yang ada di kartu ibu Anda, atau masukkan kode secara
            manual untuk melihat informasi kesehatan dan catatan kader.
          </p>
        </section>

        {/* ── Main panel ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Left – scanner / input */}
          <div className="flex flex-col gap-4">
            <div className="surface-card-strong rounded-[1.75rem] p-6">
              {/* Tab switch */}
              <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
                {(["scan", "manual"] as const).map((mode) => (
                  <button
                    key={mode}
                    id={`tab-${mode}`}
                    onClick={() => {
                      setInputMode(mode);
                      resetState();
                    }}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                      inputMode === mode
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {mode === "scan" ? "📷  Scan QR" : "⌨️  Kode Manual"}
                  </button>
                ))}
              </div>

              {/* Scan mode */}
              {inputMode === "scan" && (
                <div className="flex flex-col items-center gap-6">
                  <ScannerFrame scanning={step === "scanning"} />

                  {step === "idle" && (
                    <button
                      id="btn-scan"
                      onClick={() => simulateScan()}
                      className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[0.98]"
                    >
                      Mulai Scan
                    </button>
                  )}
                  {step === "scanning" && (
                    <button
                      onClick={resetState}
                      className="w-full rounded-2xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Batalkan
                    </button>
                  )}
                  {(step === "found" || step === "not_found") && (
                    <button
                      onClick={resetState}
                      className="w-full rounded-2xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Scan Ulang
                    </button>
                  )}

                  {/* Demo quick-scan */}
                  <div className="w-full border-t border-slate-100 pt-4">
                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Demo — pilih QR ibu
                    </p>
                    <div className="flex flex-col gap-2">
                      {demoMothers.map((m) => (
                        <button
                          key={m.id}
                          id={`demo-${m.qrCode}`}
                          onClick={() => simulateScan(m.qrCode)}
                          disabled={step === "scanning"}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 disabled:opacity-40"
                        >
                          <span className="font-semibold">{m.fullName}</span>
                          <span className="font-mono text-xs text-slate-400">
                            {m.qrCode}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Manual mode */}
              {inputMode === "manual" && (
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">
                    <svg
                      className="mx-auto h-10 w-10 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.4}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-slate-500">
                      Ketik kode dari kartu ibu Anda
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Kode QR
                    </label>
                    <input
                      id="input-manual-code"
                      value={manualCode}
                      onChange={(e) => {
                        setManualCode(e.target.value.toUpperCase());
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitManual()}
                      placeholder="Contoh: BUNDA-001"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 font-mono text-sm font-semibold tracking-wider outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                    {error && (
                      <p className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-medium text-rose-600">
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    id="btn-cari"
                    onClick={submitManual}
                    className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[0.98]"
                  >
                    Cari Data
                  </button>

                  {/* Quick fill */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Demo — isi cepat
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {demoMothers.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setManualCode(m.qrCode);
                            setError("");
                            setStep("idle");
                            setFound(null);
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                          {m.qrCode}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status pill */}
            {step !== "idle" && (
              <div
                className={`card-appear rounded-2xl border px-5 py-3.5 text-sm font-semibold ${
                  step === "scanning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : step === "found"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {step === "scanning" && "🔍  Memindai kode…"}
                {step === "found" && `✅  Data ditemukan — ${found?.fullName}`}
                {step === "not_found" && "❌  Kode tidak ditemukan. Pastikan kode benar."}
              </div>
            )}
          </div>

          {/* Right – result */}
          <div className="surface-card-strong rounded-[1.75rem] p-6">
            {step !== "found" || !found ? (
              <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <svg
                    className="h-9 w-9 text-slate-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-slate-700">
                    Data belum dimuat
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Scan atau masukkan kode QR untuk melihat informasi kesehatan
                    Anda.
                  </p>
                </div>
              </div>
            ) : (
              <MotherCard mother={found} />
            )}
          </div>
        </div>

        {/* ── Info footer ──────────────────────────────────── */}
        <section className="rounded-[1.75rem] border border-slate-100 bg-white/80 p-6">
          <p className="section-kicker">Cara penggunaan</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "🪪",
                title: "Siapkan kartu ibu",
                desc: "Pastikan kartu QR yang dibagikan kader ada di tangan Anda.",
              },
              {
                icon: "📷",
                title: "Scan atau ketik kode",
                desc: "Gunakan kamera atau masukkan kode unik yang tercetak di kartu.",
              },
              {
                icon: "📋",
                title: "Lihat data Anda",
                desc: "Data kehamilan, kunjungan, dan catatan kader akan langsung tampil.",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                  {icon}
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}