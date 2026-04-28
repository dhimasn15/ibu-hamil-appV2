import DashboardClient from "@/components/DashboardClient";
import { getDashboardSeed } from "@/services/api";

export default async function DashboardPage() {
  const { mothers, loginHistory } = await getDashboardSeed();

  return <DashboardClient initialMothers={mothers} loginHistory={loginHistory} />;
}
