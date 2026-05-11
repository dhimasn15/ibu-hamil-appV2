import AdminDashboardClient from "@/components/AdminDashboardClient";
import { getAdminSession } from "@/lib/auth";
import { getDashboardSeed } from "@/services/api";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard Admin - BundaCare",
  description:
    "Panel admin untuk memantau data ibu hamil dan menyusui di Kecamatan Tegalwaru.",
};

export default async function DashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login?redirect=/dashboard");
  }

  const { mothers, loginHistory } = await getDashboardSeed();

  return (
    <AdminDashboardClient
      currentAdmin={session}
      mothers={mothers}
      loginHistory={loginHistory}
    />
  );
}
