import { requireUser } from "@/lib/session";
import { OnboardingForm } from "@/components/OnboardingForm";
export default async function OnboardingPage() {
  const user = await requireUser();
  return <OnboardingForm name={user.name.split(" ")[0]} />;
}
