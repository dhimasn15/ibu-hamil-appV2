import { mockAdmins, mockLoginHistory, mockMothers } from "@/lib/db";
import { prisma } from "@/lib/prisma";
import type { AdminUser, LoginRecord, MotherProfile } from "@/lib/types";

function cloneMothers(): MotherProfile[] {
  return mockMothers.map((item) => ({ ...item }));
}

function cloneLogins(): LoginRecord[] {
  return mockLoginHistory.map((item) => ({ ...item }));
}

function cloneAdmins(): AdminUser[] {
  return mockAdmins.map((item) => ({ ...item }));
}

function formatLoginTimestamp(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMotherVisit(date: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function mapMother(item: Awaited<ReturnType<typeof prisma.motherProfile.findMany>>[number]): MotherProfile {
  return {
    id: item.id,
    qrCode: item.qrCode,
    fullName: item.fullName,
    age: item.age,
    category: item.category === "menyusui" ? "menyusui" : "hamil",
    babyLossHistory:
      item.babyLossHistory === "keguguran" ||
      item.babyLossHistory === "bayi_<3_bulan" ||
      item.babyLossHistory === "bayi_<1_tahun"
        ? item.babyLossHistory
        : "tidak_ada",
    address: item.address,
    village: item.village,
    rt: item.rt,
    rw: item.rw,
    latitude: item.latitude,
    longitude: item.longitude,
    lastVisit: formatMotherVisit(item.lastVisit),
    riskLevel:
      item.riskLevel === "tinggi" || item.riskLevel === "sedang"
        ? item.riskLevel
        : "rendah",
    notes: item.notes,
    gestationalAgeWeeks: item.gestationalAgeWeeks ?? undefined,
    childAgeMonths: item.childAgeMonths ?? undefined,
  };
}

export async function getPregnancyProfiles() {
  try {
    const mothers = await prisma.motherProfile.findMany({
      orderBy: { createdAt: "desc" },
    });

    return mothers.map(mapMother);
  } catch {
    return cloneMothers();
  }
}

export async function getLoginHistory() {
  try {
    const records = await prisma.loginRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return records.map<LoginRecord>((item) => ({
      id: item.id,
      adminEmail: item.adminEmail,
      adminName: item.adminName,
      method: item.method === "qr" ? "qr" : "email",
      timestamp: formatLoginTimestamp(item.createdAt),
      status: item.status === "success" ? "success" : "failed",
      device: item.device,
    }));
  } catch {
    return cloneLogins();
  }
}

export async function getAdminDirectory() {
  try {
    const admins = await prisma.adminUser.findMany({
      orderBy: { name: "asc" },
    });

    return admins.map<AdminUser>((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      role: "admin",
      qrToken: item.qrToken,
      region: item.region,
    }));
  } catch {
    return cloneAdmins();
  }
}

export async function getDashboardSeed() {
  const [mothers, loginHistory] = await Promise.all([
    getPregnancyProfiles(),
    getLoginHistory(),
  ]);

  return {
    mothers,
    loginHistory,
  };
}

export async function findMotherByQr(qrCode: string) {
  try {
    const mother = await prisma.motherProfile.findUnique({ where: { qrCode } });
    return mother ? mapMother(mother) : undefined;
  } catch {
    return cloneMothers().find((item) => item.qrCode === qrCode);
  }
}
