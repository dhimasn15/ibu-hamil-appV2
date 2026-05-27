"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import jsQR from "jsqr";
import type { AdminUser } from "@/lib/types";

type LoginClientProps = {
  admins: AdminUser[];
};

type BarcodeDetectorConstructor = new (options: {
  formats: string[];
}) => {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export default function LoginClient({ admins }: LoginClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"email" | "qr">("email");
  const [email, setEmail] = useState(admins[0]?.email ?? "");
  const [password, setPassword] = useState("");
  const [scannedQr, setScannedQr] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameRef = useRef<number | null>(null);

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
          method: "email",
          email: normalizedEmail,
          password,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        admin?: AdminUser;
      };

      if (!response.ok || !data.admin) {
        setResult(data.message ?? "Email atau password salah.");
        return;
      }

      const redirectTo = searchParams.get("redirect") ?? "/dashboard";
      setResult(`Login berhasil. Selamat datang ${data.admin.name}.`);
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setResult("Login gagal karena koneksi server bermasalah.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitQrLogin(qrToken = scannedQr) {
    if (!qrToken) {
      setResult("Scan QR code admin terlebih dahulu.");
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
          method: "qr",
          qrToken,
        }),
      });
      const data = (await response.json()) as {
        message?: string;
        admin?: AdminUser;
      };

      if (!response.ok || !data.admin) {
        setResult(data.message ?? "QR code admin tidak valid.");
        return;
      }

      const redirectTo = searchParams.get("redirect") ?? "/dashboard";
      setResult(`Login QR berhasil. Selamat datang ${data.admin.name}.`);
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setResult("Login QR gagal karena koneksi server bermasalah.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function stopScanner() {
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsScanning(false);
  }

  async function startScanner() {
    setCameraError("");
    setScannedQr("");
    setResult("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Kamera tidak tersedia di browser ini.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      const video = videoRef.current;

      if (!video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setIsScanning(true);

      const detector = window.BarcodeDetector
        ? new window.BarcodeDetector({ formats: ["qr_code"] })
        : null;

      const scan = async () => {
        if (!videoRef.current || !streamRef.current) return;

        try {
          let qrToken = "";

          if (detector) {
            const codes = await detector.detect(videoRef.current);
            qrToken = codes[0]?.rawValue.trim() ?? "";
          } else {
            const canvas = canvasRef.current;
            const context = canvas?.getContext("2d", { willReadFrequently: true });

            if (canvas && context && videoRef.current.readyState >= 2) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              qrToken = jsQR(imageData.data, imageData.width, imageData.height)?.data.trim() ?? "";
            }
          }

          if (qrToken) {
            setScannedQr(qrToken);
            stopScanner();
            await submitQrLogin(qrToken);
            return;
          }
        } catch {
          setCameraError("QR belum terbaca. Pastikan kode jelas dan dekat kamera.");
        }

        scanFrameRef.current = requestAnimationFrame(scan);
      };

      scanFrameRef.current = requestAnimationFrame(scan);
    } catch {
      setCameraError("Izin kamera ditolak atau kamera tidak dapat dibuka.");
      stopScanner();
    }
  }

  useEffect(() => stopScanner, []);

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
                    onClick={() => {
                      setMode(m);
                      if (m === "email") stopScanner();
                    }}
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

                  <div className="overflow-hidden rounded-2xl border border-amber-100 bg-slate-950">
                    <video
                      ref={videoRef}
                      muted
                      playsInline
                      className="aspect-[4/3] w-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    {!isScanning && (
                      <div className="p-5 text-center text-sm text-slate-300">
                        Klik tombol di bawah untuk membuka kamera, lalu arahkan ke QR code admin.
                      </div>
                    )}
                  </div>

                  {scannedQr && (
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                      QR terbaca. Memproses login admin...
                    </div>
                  )}

                  {cameraError && (
                    <div className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
                      {cameraError}
                    </div>
                  )}

                  <button
                    onClick={isScanning ? stopScanner : startScanner}
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-amber-500 py-3.5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Memverifikasi QR..."
                      : isScanning
                        ? "Tutup Kamera"
                        : "Buka Kamera dan Scan QR"}
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

          {/* Right – directory & guidance */}
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

            {/* Login guidance */}
            <div className="surface-card-strong rounded-[1.75rem] p-6">
              <div className="mb-4">
                <p className="section-kicker">Panduan</p>
                <h2 className="font-heading text-xl font-bold text-slate-900">
                  Cara masuk dashboard
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pilih metode login yang sesuai dengan akses admin Anda.
                </p>
              </div>
              <div className="grid gap-3">
                {[
                  {
                    title: "Gunakan email resmi",
                    description:
                      "Masukkan email dan kata sandi admin yang sudah terdaftar di sistem.",
                    badge: "Email",
                  },
                  {
                    title: "Login cepat dengan QR",
                    description:
                      "Buka tab QR, izinkan kamera, lalu arahkan ke QR admin personal.",
                    badge: "QR",
                  },
                  {
                    title: "Pantau audit di dashboard",
                    description:
                      "Riwayat akses terbaru bisa dilihat setelah masuk pada halaman dashboard admin.",
                    badge: "Audit",
                  },
                ].map((item, idx) => (
                  <div
                    key={item.title}
                    className="card-appear rounded-xl border border-slate-100 bg-white p-4"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                        {item.badge}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-sm leading-relaxed text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
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
