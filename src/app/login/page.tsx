import { Suspense } from "react";
import LoginClient from "@/components/LoginClient";
import { getAdminDirectory, getLoginHistory } from "@/services/api";

export default async function LoginPage() {
  const [admins, history] = await Promise.all([
    getAdminDirectory(),
    getLoginHistory(),
  ]);

  return (
    <Suspense fallback={null}>
      <LoginClient admins={admins} initialHistory={history} />
    </Suspense>
  );
}
