"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface OnboardingStatus {
  completed: boolean;
}

const EXCLUDED_PATHS = ["/onboarding", "/api"];

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const isExcludedPath = useMemo(
    () => EXCLUDED_PATHS.some((path) => pathname.startsWith(path)),
    [pathname],
  );

  const [isChecking, setIsChecking] = useState(!isExcludedPath);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isExcludedPath) {
      return;
    }

    async function checkOnboardingStatus() {
      try {
        const response = await fetch("/api/onboarding");
        if (!response.ok) {
          setIsChecking(false);
          return;
        }

        const status = (await response.json()) as OnboardingStatus;
        if (!status.completed) {
          setShouldRedirect(true);
          router.push("/onboarding");
        } else {
          setIsChecking(false);
        }
      } catch {
        setIsChecking(false);
      }
    }

    void checkOnboardingStatus();
  }, [isExcludedPath, router]);

  if (shouldRedirect) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white/50">Redirecting to onboarding...</p>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white/50">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
