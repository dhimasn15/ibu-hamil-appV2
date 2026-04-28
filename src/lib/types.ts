export type MotherCategory = "hamil" | "menyusui";

export type BabyLossHistory =
  | "tidak_ada"
  | "keguguran"
  | "bayi_<3_bulan"
  | "bayi_<1_tahun";

export type RiskLevel = "rendah" | "sedang" | "tinggi";

export type MotherProfile = {
  id: string;
  qrCode: string;
  fullName: string;
  age: number;
  category: MotherCategory;
  babyLossHistory: BabyLossHistory;
  address: string;
  village: string;
  rt: string;
  rw: string;
  latitude: number;
  longitude: number;
  lastVisit: string;
  riskLevel: RiskLevel;
  notes: string;
  gestationalAgeWeeks?: number;
  childAgeMonths?: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin";
  qrToken: string;
  region: string;
};

export type LoginRecord = {
  id: string;
  adminEmail: string;
  adminName: string;
  method: "email" | "qr";
  timestamp: string;
  status: "success" | "failed";
  device: string;
};
