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

export async function getPregnancyProfiles() {
  return cloneMothers();
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
  return {
    mothers: cloneMothers(),
    loginHistory: cloneLogins(),
  };
}

export async function findMotherByQr(qrCode: string) {
  return cloneMothers().find((item) => item.qrCode === qrCode);
}
