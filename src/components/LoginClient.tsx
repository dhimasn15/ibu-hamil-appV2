"use client";

import { startTransition, useState } from "react";
import Card from "@/components/Card";
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
  const [mode, setMode] = useState<"email" | "qr">("email");
  const [email, setEmail] = useState(admins[0]?.email ?? "");
  const [selectedQr, setSelectedQr] = useState(admins[0]?.qrToken ?? "");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState(initialHistory);

  function appendHistory(record: LoginRecord) {
    setHistory((current) => [record, ...current].slice(0, 8));
  }

  function submitEmailLogin() {
    const admin = admins.find((item) => item.email === email);

    startTransition(() => {
      if (!admin) {
        appendHistory({
          id: `login-${Date.now()}`,
          adminEmail: email,
          adminName: "Email tidak terdaftar",
          method: "email",
          timestamp: "Hari ini",
          status: "failed",
          device: "Browser admin",
        });
        setResult("Login ditolak. Hanya email admin terdaftar yang boleh masuk.");
        return;
      }

      appendHistory({
        id: `login-${Date.now()}`,
        adminEmail: admin.email,
        adminName: admin.name,
        method: "email",
        timestamp: "Hari ini",
        status: "success",
        device: "Browser admin",
      });
      setResult(`Login email berhasil untuk admin ${admin.name}.`);
    });
  }

  function submitQrLogin() {
    const admin = admins.find((item) => item.qrToken === selectedQr);

    startTransition(() => {
      if (!admin) {
        setResult("QR admin tidak valid.");
        return;
      }

      appendHistory({
        id: `login-${Date.now()}`,
        adminEmail: admin.email,
        adminName: admin.name,
        method: "qr",
        timestamp: "Hari ini",
        status: "success",
        device: "QR scanner",
      });
      setResult(`QR login berhasil. Selamat datang ${admin.name}.`);
    });
  }

  const selectedAdmin =
    admins.find((item) => item.qrToken === selectedQr) ?? admins[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card
        eyebrow="Autentikasi admin"
        title="Login email atau QR"
        description="Semua panel login dibuat lebih formal dan lebih dekat ke layout dashboard internal."
      >
        <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold transition ${
              mode === "email"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            Login email
          </button>
          <button
            type="button"
            onClick={() => setMode("qr")}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-semibold transition ${
              mode === "qr"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-white hover:text-slate-900"
            }`}
          >
            Login via QR
          </button>
        </div>

        {mode === "email" ? (
          <div className="mt-6 grid gap-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Email admin
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="minimal-input font-normal"
                placeholder="nama@bundacare.id"
              />
            </label>
            <button
              type="button"
              onClick={submitEmailLogin}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Masuk sebagai admin
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            <div className="classic-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <QrBadge value={selectedAdmin.qrToken} size={128} />
              <div>
                <p className="font-heading text-2xl font-semibold text-slate-900">
                  {selectedAdmin.name}
                </p>
                <p className="text-sm text-slate-500">{selectedAdmin.email}</p>
                <p className="mt-3 text-sm text-slate-600">
                  Token QR admin: {selectedAdmin.qrToken}
                </p>
              </div>
            </div>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Pilih QR admin
              <select
                value={selectedQr}
                onChange={(event) => setSelectedQr(event.target.value)}
                className="minimal-input font-normal"
              >
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.qrToken}>
                    {admin.name} • {admin.region}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={submitQrLogin}
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Simulasikan scan QR
            </button>
          </div>
        )}

        {result ? (
          <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
            {result}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6">
        <Card
          eyebrow="Admin aktif"
          title="Direktori admin yang boleh login"
          description="Daftar admin dan log akses ikut disederhanakan agar terasa lebih seperti panel kerja."
        >
          <div className="grid gap-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="classic-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">{admin.name}</p>
                  <p className="text-sm text-slate-500">{admin.email}</p>
                  <p className="mt-1 text-sm text-slate-600">{admin.region}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  admin aktif
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card
          eyebrow="Riwayat login"
          title="Log akses terbaru"
          description="Aktivitas sukses dan gagal tetap tampil, namun dengan gaya visual yang lebih konservatif."
        >
          <div className="grid gap-4">
            {history.map((entry) => (
              <div key={entry.id} className="classic-panel p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{entry.adminName}</p>
                    <p className="text-sm text-slate-500">{entry.adminEmail}</p>
                  </div>
                  <span
                    className={`rounded-md px-3 py-1 text-xs font-semibold ${
                      entry.status === "success"
                        ? "bg-slate-100 text-slate-700"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
                  <span>Metode: {entry.method}</span>
                  <span>{entry.timestamp}</span>
                  <span>{entry.device}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
