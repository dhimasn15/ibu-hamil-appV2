import CekDataClient from "@/components/CekDataClient";
import { getPregnancyProfiles } from "@/services/api";

export const metadata = {
  title: "Cek Data Ibu — BundaCare",
  description:
    "Ibu hamil dan menyusui dapat mengecek data kesehatan mereka menggunakan QR Code yang dibagikan kader.",
};

export default async function CekDataPage() {
  const mothers = await getPregnancyProfiles();

  return <CekDataClient mothers={mothers} />;
}
