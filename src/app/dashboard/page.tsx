import AdminDashboardClient from "@/components/AdminDashboardClient";
import { getDashboardSeed } from "@/services/api";

export const metadata = {
  title: "Dashboard Admin — BundaCare",
  description: "Panel admin untuk memantau data ibu hamil dan menyusui di Kecamatan Tegalwaru.",
};

export default async function DashboardPage() {
  const { mothers, loginHistory } = await getDashboardSeed();

  return <AdminDashboardClient mothers={mothers} loginHistory={loginHistory} />;
}
