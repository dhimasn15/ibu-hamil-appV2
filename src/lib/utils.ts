import type {
  BabyLossHistory,
  MotherCategory,
  MotherProfile,
  RiskLevel,
} from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatCategoryLabel(category: MotherCategory) {
  return category === "hamil" ? "Ibu hamil" : "Ibu menyusui";
}

export function formatBabyHistoryLabel(history: BabyLossHistory) {
  switch (history) {
    case "keguguran":
      return "Keguguran";
    case "bayi_<3_bulan":
      return "Bayi meninggal < 3 bulan";
    case "bayi_<1_tahun":
      return "Bayi meninggal < 1 tahun";
    default:
      return "Tidak ada";
  }
}

export function formatRiskLabel(level: RiskLevel) {
  if (level === "tinggi") return "Risiko tinggi";
  if (level === "sedang") return "Risiko sedang";
  return "Risiko rendah";
}

export function createMotherId(seed: number) {
  return `mother-${seed}`;
}

export function createQrCode(seed: number) {
  return `BUNDA-${String(seed).padStart(3, "0")}`;
}

export function deriveRiskLevel(profile: Pick<MotherProfile, "age" | "babyLossHistory">): RiskLevel {
  if (profile.age >= 35 || profile.babyLossHistory !== "tidak_ada") {
    return "tinggi";
  }

  if (profile.age <= 22) {
    return "sedang";
  }

  return "rendah";
}

export function hashToMatrix(value: string, size = 21) {
  const numbers = Array.from(value).map((char) => char.charCodeAt(0));

  return Array.from({ length: size * size }, (_, index) => {
    const charCode = numbers[index % numbers.length] ?? 17;
    return (charCode + index * 13) % 7 < 3;
  });
}
