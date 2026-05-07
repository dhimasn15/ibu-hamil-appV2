import Link from "next/link";
import Card from "@/components/Card";
import MapCard from "@/components/MapCard";
import { getDashboardSeed } from "@/services/api";

export default async function Home() {
  const { mothers, loginHistory } = await getDashboardSeed();
  const highRisk = mothers.filter((item) => item.riskLevel === "tinggi").length;
  const withHistory = mothers.filter(
    (item) => item.babyLossHistory !== "tidak_ada",
  ).length;

  return (
    <div className="flex flex-col gap-8 lg:gap-10">
      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="surface-card-strong rounded-[1.75rem] p-6 sm:p-8 lg:p-10">
          <h1 className="section-title mt-4 max-w-3xl text-slate-900">
            Dashboard ibu hamil dan menyusui yang terasa ringkas, tenang, dan profesional.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Sistem Database untuk Ibu Hamil dan Menyusui Berbasis Web.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/cekdata"
              className="rounded-full bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 hover:text-slate-900"
            >
              Cari Data Ibu Hamil & Menyusui
            </Link>
          </div>
        </div>

        <Card
          eyebrow="Ringkasan cepat"
          title="Snapshot wilayah binaan"
          description="Semua angka ini masih memakai mock data frontend, tetapi komposisi tampilannya sudah diarahkan seperti dashboard operasional yang final."
        >
          <div className="data-grid">
            <div className="rounded-[1.5rem] bg-white/90 p-4">
              <p className="text-sm text-slate-500">Total ibu</p>
              <p className="mt-2 font-heading text-4xl font-bold text-slate-900">
                {mothers.length}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/90 p-4">
              <p className="text-sm text-slate-500">Risiko tinggi</p>
              <p className="mt-2 font-heading text-4xl font-bold text-slate-900">
                {highRisk}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/90 p-4">
              <p className="text-sm text-slate-500">Riwayat kematian bayi</p>
              <p className="mt-2 font-heading text-4xl font-bold text-slate-900">
                {withHistory}
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/90 p-4">
              <p className="text-sm text-slate-500">Login admin tercatat</p>
              <p className="mt-2 font-heading text-4xl font-bold text-slate-900">
                {loginHistory.length}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card
          eyebrow="Alur utama"
          title="Fitur yang sudah divisualkan"
          description="Semua halaman ini tetap saling tersambung, hanya tampilannya dibuat lebih kalem dan lebih cocok untuk penggunaan harian."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Tambah data ibu hamil & menyusui",
              "Dashboard + filter nama, umur, kategori, RT/RW",
              "Filter riwayat keguguran, bayi < 3 bulan, bayi < 1 tahun",
              "Login admin via email atau QR",
              "Riwayat login admin",
              "QR per ibu untuk akses keluarga",
              "Peta lokasi dengan marker per ibu",
            ].map((item) => (
              <div
                key={item}
                className="border border-slate-200/70 bg-white/80 px-5 py-4 pl-7 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </Card>

        <Card
          eyebrow="Peta Kecamatan Tegalwaru"
          title="Batas wilayah & cakupan binaan"
          description="Peta satelit menampilkan batas wilayah Kecamatan Tegalwaru, Kabupaten Purwakarta, Jawa Barat beserta titik landmark utama."
        >
          <MapCard />
        </Card>
      </section>
    </div>
  );
}
