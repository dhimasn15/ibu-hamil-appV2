import { mockAdmins, mockLoginHistory, mockMothers } from "@/lib/db";
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

export async function getPregnancyProfiles() {
  return cloneMothers();
}

export async function getLoginHistory() {
  return cloneLogins();
}

export async function getAdminDirectory() {
  return cloneAdmins();
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
