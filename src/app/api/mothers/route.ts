import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { BabyLossHistory, MotherCategory, MotherProfile } from "@/lib/types";
import { deriveRiskLevel } from "@/lib/utils";

const categories: MotherCategory[] = ["hamil", "menyusui"];
const babyHistories: BabyLossHistory[] = [
  "tidak_ada",
  "keguguran",
  "bayi_<3_bulan",
  "bayi_<1_tahun",
];

function formatMotherVisit(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function makeQrCode() {
  return `BUNDA-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const address = String(body.address ?? "").trim();
    const village = String(body.village ?? "").trim();
    const age = Number(body.age);
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const category = categories.includes(body.category) ? body.category : undefined;
    const babyLossHistory = babyHistories.includes(body.babyLossHistory)
      ? body.babyLossHistory
      : undefined;

    if (!fullName || !address || !village) {
      return NextResponse.json(
        { message: "Nama, alamat, dan desa/kelurahan wajib diisi." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(age) || age < 10 || age > 60) {
      return NextResponse.json(
        { message: "Umur ibu harus diisi antara 10 sampai 60 tahun." },
        { status: 400 },
      );
    }

    if (!category || !babyLossHistory) {
      return NextResponse.json(
        { message: "Kategori atau riwayat bayi tidak valid." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { message: "Latitude harus diisi dengan angka antara -90 sampai 90." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { message: "Longitude harus diisi dengan angka antara -180 sampai 180." },
        { status: 400 },
      );
    }

    const gestationalAgeWeeks = Number(body.gestationalAgeWeeks);
    const childAgeMonths = Number(body.childAgeMonths);

    if (
      category === "hamil" &&
      (!Number.isFinite(gestationalAgeWeeks) || gestationalAgeWeeks < 1 || gestationalAgeWeeks > 42)
    ) {
      return NextResponse.json(
        { message: "Usia kehamilan harus diisi antara 1 sampai 42 minggu." },
        { status: 400 },
      );
    }

    if (
      category === "menyusui" &&
      (!Number.isFinite(childAgeMonths) || childAgeMonths < 0 || childAgeMonths > 24)
    ) {
      return NextResponse.json(
        { message: "Usia anak harus diisi antara 0 sampai 24 bulan." },
        { status: 400 },
      );
    }

    const riskLevel = deriveRiskLevel({ age, babyLossHistory });
    const lastVisit = body.lastVisit ? new Date(String(body.lastVisit)) : new Date();

    if (Number.isNaN(lastVisit.getTime())) {
      return NextResponse.json(
        { message: "Tanggal kunjungan terakhir tidak valid." },
        { status: 400 },
      );
    }

    const item = await prisma.motherProfile.create({
      data: {
        qrCode: makeQrCode(),
        fullName,
        age,
        category,
        babyLossHistory,
        address,
        village,
        rt: String(body.rt ?? "-").trim() || "-",
        rw: String(body.rw ?? "-").trim() || "-",
        latitude,
        longitude,
        lastVisit,
        riskLevel,
        notes: String(body.notes ?? "Belum ada catatan tambahan.").trim() || "Belum ada catatan tambahan.",
        gestationalAgeWeeks: category === "hamil" ? gestationalAgeWeeks : null,
        childAgeMonths: category === "menyusui" ? childAgeMonths : null,
      },
    });

    const mother: MotherProfile = {
      id: item.id,
      qrCode: item.qrCode,
      fullName: item.fullName,
      age: item.age,
      category,
      babyLossHistory,
      address: item.address,
      village: item.village,
      rt: item.rt,
      rw: item.rw,
      latitude: item.latitude,
      longitude: item.longitude,
      lastVisit: formatMotherVisit(item.lastVisit),
      riskLevel,
      notes: item.notes,
      gestationalAgeWeeks: item.gestationalAgeWeeks ?? undefined,
      childAgeMonths: item.childAgeMonths ?? undefined,
    };

    return NextResponse.json({ mother }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Data ibu gagal disimpan ke database." },
      { status: 500 },
    );
  }
}
