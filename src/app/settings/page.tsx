"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    async function fetchCurrentUser() {
      try {
        const response = await fetch("/api/current-user");

        if (!response.ok) {
          router.push("/");
          return;
        }

        const user = (await response.json()) as CurrentUser;
        setCurrentUser(user);
        setIsLoading(false);
      } catch {
        router.push("/");
      }
    }

    void fetchCurrentUser();
  }, [router]);

  if (isLoading || !currentUser) {
    return (
      <main className="flex flex-1 overflow-auto flex-col items-center text-white">
        <div className="container flex flex-col items-center gap-8 px-4 py-16">
          <p className="text-white/50">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 overflow-auto flex-col items-center text-white">
      <div className="container flex flex-col items-center gap-8 px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">Settings</h1>
          <p className="mt-2 text-lg text-white/60">
            Account: {currentUser.email}
          </p>
        </div>
        <div className="w-full max-w-2xl rounded-lg border border-white/10 bg-white/5 p-6">
          <p className="text-white/60">Settings will be available soon.</p>
        </div>
      </div>
    </main>
  );
}
