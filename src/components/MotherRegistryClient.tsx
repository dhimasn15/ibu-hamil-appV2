"use client";

import { startTransition, useState } from "react";
import Card from "@/components/Card";
import QrBadge from "@/components/QrBadge";
import type { BabyLossHistory, MotherCategory, MotherProfile } from "@/lib/types";
import {
  createMotherId,
  createQrCode,
  deriveRiskLevel,
  formatBabyHistoryLabel,
  formatCategoryLabel,
} from "@/lib/utils";

type MotherRegistryClientProps = {
  initialMothers: MotherProfile[];
};

type FormState = {
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
  notes: string;
};

const defaultForm: FormState = {
  fullName: "",
  age: "",
  category: "hamil",
  babyLossHistory: "tidak_ada",
  address: "",
  village: "",
  rt: "",
  rw: "",
  latitude: "-6.2100",
  longitude: "106.8450",
  notes: "",
};

export default function MotherRegistryClient({
  initialMothers,
}: MotherRegistryClientProps) {
  const [mothers, setMothers] = useState(initialMothers);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [feedback, setFeedback] = useState("");

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.fullName || !form.age || !form.address || !form.village || !form.rt || !form.rw) {
      setFeedback("Lengkapi nama, umur, alamat, kelurahan, RT, dan RW terlebih dahulu.");
      return;
    }

    startTransition(() => {
      const nextIndex = mothers.length + 1;
      const nextEntry: MotherProfile = {
        id: createMotherId(nextIndex),
        qrCode: createQrCode(nextIndex),
        fullName: form.fullName,
        age: Number(form.age),
        category: form.category,
        babyLossHistory: form.babyLossHistory,
        address: form.address,
        village: form.village,
        rt: form.rt.padStart(2, "0"),
        rw: form.rw.padStart(2, "0"),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        lastVisit: "Hari ini",
        riskLevel: deriveRiskLevel({
          age: Number(form.age),
          babyLossHistory: form.babyLossHistory,
        }),
        notes: form.notes || "Belum ada catatan tambahan dari admin.",
      };

      setMothers((current) => [nextEntry, ...current]);
      setForm(defaultForm);
      setFeedback(
        `Data ${nextEntry.fullName} berhasil ditambahkan untuk kategori ${formatCategoryLabel(nextEntry.category)}.`,
      );
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <Card
        eyebrow="Input data"
        title="Tambah data ibu hamil atau menyusui"
        description="Susunan form dibuat sederhana agar nyaman dipakai admin dalam penggunaan harian."
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Nama lengkap
              <input
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className="minimal-input font-normal"
                placeholder="Contoh: Fatimah Nuraini"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Umur
              <input
                value={form.age}
                onChange={(event) => updateField("age", event.target.value)}
                type="number"
                className="minimal-input font-normal"
                placeholder="28"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Kategori
              <select
                value={form.category}
                onChange={(event) =>
                  updateField("category", event.target.value as MotherCategory)
                }
                className="minimal-input font-normal"
              >
                <option value="hamil">Ibu hamil</option>
                <option value="menyusui">Ibu menyusui</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Riwayat kematian bayi
              <select
                value={form.babyLossHistory}
                onChange={(event) =>
                  updateField(
                    "babyLossHistory",
                    event.target.value as BabyLossHistory,
                  )
                }
                className="minimal-input font-normal"
              >
                <option value="tidak_ada">Tidak ada</option>
                <option value="keguguran">Keguguran</option>
                <option value="bayi_<3_bulan">Bayi meninggal &lt; 3 bulan</option>
                <option value="bayi_<1_tahun">Bayi meninggal &lt; 1 tahun</option>
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Alamat
            <input
              value={form.address}
              onChange={(event) => updateField("address", event.target.value)}
              className="minimal-input font-normal"
              placeholder="Jl. Mawar No. 10"
            />
          </label>

          <div className="grid gap-4 md:grid-cols-4">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700 md:col-span-2">
              Kelurahan
              <input
                value={form.village}
                onChange={(event) => updateField("village", event.target.value)}
                className="minimal-input font-normal"
                placeholder="Kelurahan Sukamaju"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              RT
              <input
                value={form.rt}
                onChange={(event) => updateField("rt", event.target.value)}
                className="minimal-input font-normal"
                placeholder="03"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              RW
              <input
                value={form.rw}
                onChange={(event) => updateField("rw", event.target.value)}
                className="minimal-input font-normal"
                placeholder="05"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Latitude
              <input
                value={form.latitude}
                onChange={(event) => updateField("latitude", event.target.value)}
                className="minimal-input font-normal"
                placeholder="-6.2100"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
              Longitude
              <input
                value={form.longitude}
                onChange={(event) => updateField("longitude", event.target.value)}
                className="minimal-input font-normal"
                placeholder="106.8450"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            Catatan admin
            <textarea
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              className="minimal-input min-h-32 font-normal"
              placeholder="Catatan kunjungan, edukasi, atau tindak lanjut"
            />
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Simpan data ibu
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                setFeedback("Form dikembalikan ke kondisi awal.");
              }}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Reset form
            </button>
          </div>

          {feedback ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-slate-700">
              {feedback}
            </div>
          ) : null}
        </form>
      </Card>

      <Card
        eyebrow="Preview data"
        title="Data terbaru dan QR ibu"
        description="Kartu preview tetap informatif, dengan gaya visual yang lebih sederhana."
      >
        <div className="grid gap-4">
          {mothers.slice(0, 5).map((mother) => (
            <div key={mother.id} className="classic-panel p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-2xl font-semibold text-slate-900">
                    {mother.fullName}
                  </p>
                  <p className="text-sm text-slate-500">
                    {mother.age} tahun • {formatCategoryLabel(mother.category)} • RT{" "}
                    {mother.rt}/RW {mother.rw}
                  </p>
                  <p className="mt-3 text-sm text-slate-600">
                    Riwayat: {formatBabyHistoryLabel(mother.babyLossHistory)}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{mother.notes}</p>
                </div>
                <div className="flex items-center gap-3">
                  <QrBadge value={mother.qrCode} size={88} />
                  <div className="text-sm text-slate-600">
                    <p className="font-semibold text-slate-900">Kode QR</p>
                    <p>{mother.qrCode}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
