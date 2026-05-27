import { Suspense } from "react";
import LoginClient from "@/components/LoginClient";
import { getAdminDirectory } from "@/services/api";

export default async function LoginPage() {
  const admins = await getAdminDirectory();

  return (
    <Suspense fallback={null}>
      <LoginClient admins={admins} />
    </Suspense>
  );
}
