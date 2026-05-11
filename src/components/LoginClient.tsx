"use client";

import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QrBadge from "@/components/QrBadge";
import type { AdminUser, LoginRecord } from "@/lib/types";

type LoginClientProps = {
  admins: AdminUser[];
  initialHistory: LoginRecord[];
};

export default function LoginClient({
  admins,
  initialHistory,
}: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"email" | "qr">("email");
  const [email, setEmail] = useState(admins[0]?.email ?? "");
  const [password, setPassword] = useState("");
  const [selectedQr, setSelectedQr] = useState(admins[0]?.qrToken ?? "");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(initialHistory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function appendHistory(record: LoginRecord) {
    setHistory((current) => [record, ...current].slice(0, 8));
  }

  async function submitEmailLogin() {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setResult("Email dan password wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    startTransition(() => {
      setResult("");
    });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        admin?: AdminUser;
      };

      if (!response.ok || !data.admin) {
        appendHistory({
          id: `login-${Date.now()}`,
          adminEmail: normalizedEmail,
          adminName: "Login gagal",
          method: "email",
          timestamp: new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          status: "failed",
          device: "Browser admin",
        });
        setResult(data.message ?? "Email atau password salah.");
        return;
      }

      const redirectTo = searchParams.get("redirect") ?? "/dashboard";
      appendHistory({
        id: `login-${Date.now()}`,
        adminEmail: data.admin.email,
        adminName: data.admin.name,
        method: "email",
        timestamp: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        status: "success",
        device: "Browser admin",
      });
      setResult(`Login berhasil. Selamat datang ${data.admin.name}.`);
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setResult("Login gagal karena koneksi server bermasalah.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function submitQrLogin() {
    setResult(
      "Login QR belum diaktifkan untuk akses dashboard. Gunakan email dan password admin dari database.",
    );
  }

  const selectedAdmin =
    admins.find((item) => item.qrToken === selectedQr) ?? admins[0];

  return (
    <>
      <style>{`
        @keyframes cardAppear {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .card-appear { animation: cardAppear 0.45s ease both; }
      `}</style>

      <div className="flex flex-col gap-8">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="surface-card-strong rounded-[2rem] p-6 sm:p-10">
          <p className="section-kicker">Panel Admin</p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-slate-900 sm:text-5xl">
            Login ke dashboard.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Masuk menggunakan email admin terdaftar atau scan QR code untuk
            mengakses panel manajemen BundaCare.
          </p>
        </section>

        {/* ── Main panel ────────────────────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          {/* Left – login form */}
          <div className="flex flex-col gap-4">
            <div className="surface-card-strong rounded-[1.75rem] p-6">
              {/* Tab switch */}
              <div className="mb-6 flex rounded-2xl bg-slate-100 p-1">
                {(["email", "qr"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                      mode === m
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {m === "email" ? "📧  Login Email" : "📱  Login QR"}
                  </button>
                ))}
              </div>

              {/* Email mode */}
              {mode === "email" && (
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
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-slate-500">
                      Masuk dengan email admin yang terdaftar
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Email Admin
                    </label>
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      onKeyDown={(e) => e.key === "Enter" && submitEmailLogin()}
                      placeholder="nama@bundacare.id"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Password
                    </label>
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type="password"
                      onKeyDown={(e) => e.key === "Enter" && submitEmailLogin()}
                      placeholder="Masukkan password admin"
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </div>

                  <button
                    onClick={submitEmailLogin}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Memeriksa akun..." : "Masuk sebagai admin"}
                  </button>

                  {/* Admin quick select */}
                  <div className="border-t border-slate-100 pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Pilih admin cepat
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {admins.slice(0, 3).map((admin) => (
                        <button
                          key={admin.id}
                          onClick={() => {
                            setEmail(admin.email);
                            setPassword("");
                          }}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-amber-300 hover:bg-amber-50"
                        >
                          {admin.email.split("@")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* QR mode */}
              {mode === "qr" && (
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
                      Scan QR code admin untuk login cepat
                    </p>
                  </div>

                  {/* QR Display */}
                  <div className="rounded-2xl border border-amber-100 bg-amber-50/30 p-5">
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                      <QrBadge value={selectedAdmin.qrToken} size={120} />
                      <div className="text-center sm:text-left">
                        <p className="font-heading text-xl font-semibold text-slate-900">
                          {selectedAdmin.name}
                        </p>
                        <p className="text-sm text-slate-500">{selectedAdmin.email}</p>
                        <p className="mt-2 text-xs font-mono text-slate-400">
                          Token: {selectedAdmin.qrToken}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                      Pilih Admin
                    </label>
                    <select
                      value={selectedQr}
                      onChange={(event) => setSelectedQr(event.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    >
                      {admins.map((admin) => (
                        <option key={admin.id} value={admin.qrToken}>
                          {admin.name} — {admin.region}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={submitQrLogin}
                    className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[0.98]"
                  >
                    Simulasikan Scan QR
                  </button>
                </div>
              )}

              {/* Result message */}
              {result && (
                <div
                  className={`mt-5 rounded-2xl border px-5 py-3.5 text-sm font-semibold ${
                    result.includes("berhasil")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  {result.includes("berhasil") ? "✅" : "❌"} {result}
                </div>
              )}
            </div>
          </div>

          {/* Right – directory & history */}
          <div className="flex flex-col gap-6">
            {/* Admin directory */}
            <div className="surface-card-strong rounded-[1.75rem] p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="section-kicker">Direktori</p>
                  <h2 className="font-heading text-xl font-bold text-slate-900">
                    Admin aktif
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Total {admins.length}
                </span>
              </div>
              <div className="grid gap-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="card-appear flex items-center justify-between rounded-xl border border-slate-100 bg-white p-4 transition hover:border-amber-200 hover:bg-amber-50/20"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{admin.name}</p>
                      <p className="text-sm text-slate-500">{admin.email}</p>
                      <p className="mt-1 text-xs text-slate-400">{admin.region}</p>
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <svg
                        className="h-4 w-4 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Login history */}
            <div className="surface-card-strong rounded-[1.75rem] p-6">
              <div className="mb-4">
                <p className="section-kicker">Riwayat</p>
                <h2 className="font-heading text-xl font-bold text-slate-900">
                  Log akses terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Aktivitas login admin terakhir
                </p>
              </div>
              <div className="grid gap-3">
                {history.map((entry, idx) => (
                  <div
                    key={entry.id}
                    className="card-appear rounded-xl border border-slate-100 bg-white p-4"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {entry.adminName}
                        </p>
                        <p className="text-xs text-slate-500">{entry.adminEmail}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          entry.status === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {entry.status === "success" ? "Berhasil" : "Gagal"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
                          />
                        </svg>
                        {entry.method === "email" ? "Email" : "QR Code"}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                          />
                        </svg>
                        {entry.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                          />
                        </svg>
                        {entry.device}
                      </span>
                    </div>
                  </div>
                ))}
                {history.length === 0 && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-500">Belum ada riwayat login</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Info footer ──────────────────────────────────── */}
        <section className="rounded-[1.75rem] border border-slate-100 bg-white/80 p-6">
          <p className="section-kicker">Informasi</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                🔐
              </span>
              <div>
                <p className="font-semibold text-slate-800">Login aman</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Hanya admin terdaftar yang dapat mengakses dashboard
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                📱
              </span>
              <div>
                <p className="font-semibold text-slate-800">QR Code unik</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                  Setiap admin memiliki QR code personal untuk login cepat
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
