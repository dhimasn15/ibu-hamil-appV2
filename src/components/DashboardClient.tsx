"use client";

import Link from "next/link";
import { useDeferredValue, useState } from "react";
import Card from "@/components/Card";
import MapPanel from "@/components/MapPanel";
import QrBadge from "@/components/QrBadge";
import type { LoginRecord, MotherProfile } from "@/lib/types";
import {
  formatBabyHistoryLabel,
  formatCategoryLabel,
  formatRiskLabel,
} from "@/lib/utils";

type DashboardClientProps = {
  initialMothers: MotherProfile[];
  loginHistory: LoginRecord[];
};

export default function DashboardClient({
  initialMothers,
  loginHistory,
}: DashboardClientProps) {
  const [nameQuery, setNameQuery] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [category, setCategory] = useState("semua");
  const [babyHistory, setBabyHistory] = useState("semua");
  const [neighbourhood, setNeighbourhood] = useState("");
  const deferredNameQuery = useDeferredValue(nameQuery);

  const filteredMothers = initialMothers.filter((mother) => {
    const matchesName = mother.fullName
      .toLowerCase()
      .includes(deferredNameQuery.toLowerCase());
    const matchesMinAge = minAge ? mother.age >= Number(minAge) : true;
    const matchesMaxAge = maxAge ? mother.age <= Number(maxAge) : true;
    const matchesCategory = category === "semua" ? true : mother.category === category;
    const matchesHistory =
      babyHistory === "semua" ? true : mother.babyLossHistory === babyHistory;
    const neighbourhoodKeyword = neighbourhood.toLowerCase();
    const matchesNeighbourhood = neighbourhoodKeyword
      ? [mother.rt, mother.rw, mother.address, mother.village]
          .join(" ")
          .toLowerCase()
          .includes(neighbourhoodKeyword)
      : true;

    return (
      matchesName &&
      matchesMinAge &&
      matchesMaxAge &&
      matchesCategory &&
      matchesHistory &&
      matchesNeighbourhood
    );
  });

  const pregnantCount = filteredMothers.filter((item) => item.category === "hamil").length;
  const breastfeedingCount = filteredMothers.filter(
    (item) => item.category === "menyusui",
  ).length;
  const highRiskCount = filteredMothers.filter(
    (item) => item.riskLevel === "tinggi",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <section className="surface-card-strong rounded-[2rem] p-6 sm:p-8">
        <p className="section-kicker">Dashboard operasional</p>
        <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <h1 className="font-heading text-4xl font-bold text-slate-900 sm:text-5xl">
              Pantau data ibu hamil dan menyusui dalam satu layar kerja.
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Filter sudah mengikuti requirement utama: nama, umur, kategori,
              riwayat kematian bayi, serta RT/RW atau alamat wilayah.
            </p>
          </div>
          <div className="data-grid w-full lg:max-w-3xl">
            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-sm text-slate-500">Tampil saat ini</p>
              <p className="mt-2 font-heading text-4xl font-bold text-slate-900">
                {filteredMothers.length}
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-sm text-slate-500">Ibu hamil</p>
              <p className="mt-2 font-heading text-4xl font-bold text-amber-700">
                {pregnantCount}
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-sm text-slate-500">Ibu menyusui</p>
              <p className="mt-2 font-heading text-4xl font-bold text-teal-700">
                {breastfeedingCount}
              </p>
            </div>
            <div className="rounded-3xl bg-white/80 p-4">
              <p className="text-sm text-slate-500">Risiko tinggi</p>
              <p className="mt-2 font-heading text-4xl font-bold text-rose-700">
                {highRiskCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Card
        eyebrow="Filter data"
        title="Saring data sesuai kebutuhan lapangan"
        description="Gunakan kombinasi filter untuk memudahkan prioritas home visit, pendampingan, dan follow-up kader."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Nama
            <input
              value={nameQuery}
              onChange={(event) => setNameQuery(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-amber-400"
              placeholder="Cari nama ibu"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Umur minimum
            <input
              value={minAge}
              onChange={(event) => setMinAge(event.target.value)}
              type="number"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-amber-400"
              placeholder="20"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Umur maksimum
            <input
              value={maxAge}
              onChange={(event) => setMaxAge(event.target.value)}
              type="number"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-amber-400"
              placeholder="35"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Kategori
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-amber-400"
            >
              <option value="semua">Semua</option>
              <option value="hamil">Ibu hamil</option>
              <option value="menyusui">Ibu menyusui</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Riwayat kematian bayi
            <select
              value={babyHistory}
              onChange={(event) => setBabyHistory(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-amber-400"
            >
              <option value="semua">Semua</option>
              <option value="tidak_ada">Tidak ada</option>
              <option value="keguguran">Keguguran</option>
              <option value="bayi_<3_bulan">Bayi meninggal &lt; 3 bulan</option>
              <option value="bayi_<1_tahun">Bayi meninggal &lt; 1 tahun</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            RT / RW / alamat
            <input
              value={neighbourhood}
              onChange={(event) => setNeighbourhood(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-amber-400"
              placeholder="RT 03, RW 05, Sukamaju"
            />
          </label>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card
          eyebrow="Data terfilter"
          title="Daftar ibu"
          description="Kartu dan tabel ini nanti cocok untuk dihubungkan ke edit, detail, dan riwayat kunjungan."
        >
          <div className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80">
            <div className="hidden grid-cols-[1.5fr_0.6fr_0.7fr_1fr_1fr_0.9fr] gap-3 border-b border-slate-100 px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 md:grid">
              <span>Nama</span>
              <span>Umur</span>
              <span>Kategori</span>
              <span>Riwayat</span>
              <span>RT/RW</span>
              <span>QR</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredMothers.map((mother) => (
                <div
                  key={mother.id}
                  className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_0.6fr_0.7fr_1fr_1fr_0.9fr] md:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{mother.fullName}</p>
                    <p className="text-sm text-slate-500">{formatRiskLabel(mother.riskLevel)}</p>
                  </div>
                  <p className="text-sm text-slate-700">{mother.age} tahun</p>
                  <p className="text-sm text-slate-700">
                    {formatCategoryLabel(mother.category)}
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatBabyHistoryLabel(mother.babyLossHistory)}
                  </p>
                  <p className="text-sm text-slate-700">
                    RT {mother.rt}/RW {mother.rw}
                  </p>
                  <Link
                    href={`/qr/${mother.qrCode}`}
                    className="inline-flex w-fit rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
                  >
                    Lihat QR
                  </Link>
                </div>
              ))}
              {filteredMothers.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Tidak ada data yang cocok dengan kombinasi filter saat ini.
                </div>
              ) : null}
            </div>
          </div>
        </Card>

        <div className="grid gap-6">
          <Card
            eyebrow="Peta lokasi"
            title="Marker ibu berdasarkan titik koordinat"
            description="Untuk MVP frontend, peta dibuat sebagai panel visual marker. Nanti mudah diganti ke Google Maps atau Leaflet."
          >
            <MapPanel mothers={filteredMothers.length ? filteredMothers : initialMothers} />
          </Card>

          <Card
            eyebrow="Akses keluarga"
            title="QR yang dibagikan ke keluarga"
            description="Setiap ibu punya QR unik yang bisa diarahkan ke halaman detail akses keluarga."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredMothers.slice(0, 4).map((mother) => (
                <div
                  key={mother.id}
                  className="rounded-[1.5rem] border border-white/75 bg-white/75 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{mother.fullName}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                        {mother.qrCode}
                      </p>
                    </div>
                    <QrBadge value={mother.qrCode} size={72} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card
        eyebrow="Riwayat login"
        title="Aktivitas admin"
        description="Riwayat ini berguna untuk audit akses dashboard dan bisa disambungkan ke backend auth nanti."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {loginHistory.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.5rem] border border-white/75 bg-white/75 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{item.adminName}</p>
                  <p className="text-sm text-slate-500">{item.adminEmail}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "success"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span>Metode: {item.method}</span>
                <span>{item.timestamp}</span>
                <span>{item.device}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
