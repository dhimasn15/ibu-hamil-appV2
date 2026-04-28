import MotherRegistryClient from "@/components/MotherRegistryClient";
import { getPregnancyProfiles } from "@/services/api";

export default async function MotherRegistryPage() {
  const mothers = await getPregnancyProfiles();

  return <MotherRegistryClient initialMothers={mothers} />;
}
