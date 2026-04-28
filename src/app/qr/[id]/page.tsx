import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/Card";
import QrBadge from "@/components/QrBadge";
import { findMotherByQr } from "@/services/api";
import { formatBabyHistoryLabel, formatCategoryLabel } from "@/lib/utils";

export default async function FamilyAccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mother = await findMotherByQr(id);

  if (!mother) {
    notFound();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <Card
        eyebrow="Akses keluarga"
        title="QR ibu"
        description="Halaman akses keluarga juga disederhanakan agar terlihat lebih formal dan mudah dipahami."
      >
        <div className="classic-panel flex flex-col items-center gap-4 p-6">
          <QrBadge value={mother.qrCode} size={176} />
          <div className="text-center">
            <p className="font-heading text-2xl font-semibold text-slate-900">
              {mother.fullName}
            </p>
            <p className="text-sm text-slate-500">Kode akses: {mother.qrCode}</p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Kembali ke dashboard
          </Link>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card
          eyebrow="Profil ibu"
          title={`${formatCategoryLabel(mother.category)} terpantau`}
          description="Ringkasan ini bisa dibuka keluarga untuk melihat kondisi dasar dan tindak lanjut terbaru."
        >
          <div className="data-grid">
            <div className="classic-panel p-4">
              <p className="text-sm text-slate-500">Usia</p>
              <p className="mt-2 font-heading text-3xl font-bold text-slate-900">
                {mother.age} tahun
              </p>
            </div>
            <div className="classic-panel p-4">
              <p className="text-sm text-slate-500">Risiko</p>
              <p className="mt-2 font-heading text-3xl font-bold text-slate-900">
                {mother.riskLevel}
              </p>
            </div>
            <div className="classic-panel p-4">
              <p className="text-sm text-slate-500">RT / RW</p>
              <p className="mt-2 font-heading text-3xl font-bold text-slate-900">
                {mother.rt}/{mother.rw}
              </p>
            </div>
            <div className="classic-panel p-4">
              <p className="text-sm text-slate-500">Kunjungan terakhir</p>
              <p className="mt-2 font-heading text-3xl font-bold text-slate-900">
                {mother.lastVisit}
              </p>
            </div>
          </div>
        </Card>

        <Card
          eyebrow="Tindak lanjut"
          title="Catatan untuk keluarga"
          description="Konten informasi dibuat datar dan sederhana agar fokus ke isi, bukan dekorasi."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="classic-subtle p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Riwayat
              </p>
              <p className="mt-2 text-base text-slate-700">
                {formatBabyHistoryLabel(mother.babyLossHistory)}
              </p>
            </div>
            <div className="classic-subtle p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Alamat
              </p>
              <p className="mt-2 text-base text-slate-700">
                {mother.address}, {mother.village}
              </p>
            </div>
            <div className="classic-subtle p-5 md:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                Catatan admin
              </p>
              <p className="mt-2 text-base leading-7 text-slate-700">
                {mother.notes}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
