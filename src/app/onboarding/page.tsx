import { redirect } from "next/navigation";

import { IamService } from "~/lib/domains/iam";
import { OnboardingWizard } from "~/app/onboarding/_components";

export default async function OnboardingPage() {
  const currentUser = await IamService.getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  const isOnboardingCompleted = await IamService.isOnboardingCompleted(
    currentUser.id,
  );

  if (isOnboardingCompleted) {
    redirect("/contacts");
  }

  return (
    <main className="flex min-h-screen flex-col items-center text-white">
      <div className="container flex flex-col items-center gap-8 px-4 py-16">
        <OnboardingWizard />
      </div>
    </main>
  );
}
