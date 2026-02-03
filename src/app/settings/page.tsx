import { redirect } from "next/navigation";

import { IamService } from "~/lib/domains/iam";
import { AiPreferencesForm } from "~/app/settings/_components";

export default async function SettingsPage() {
  const currentUser = await IamService.getCurrentUser();

  if (!currentUser) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center text-white">
      <div className="container flex flex-col items-center gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">Settings</h1>
          <p className="mt-2 text-lg text-white/60">
            Configure your AI assistant
          </p>
        </div>
        <AiPreferencesForm />
      </div>
    </main>
  );
}
