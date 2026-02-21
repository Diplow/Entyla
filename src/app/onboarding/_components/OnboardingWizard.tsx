"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OnboardingWizard() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleGetStarted() {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      router.push("/");
    } catch {
      setErrorMessage("Failed to complete setup. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome to Entyla!
        </h1>
        <p className="mt-4 text-lg text-white/70">
          Track your AI experimentation portfolio with weekly coaching and
          budget visibility.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold">How it works</h2>
        <ul className="mt-4 space-y-3 text-white/70">
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
              1
            </span>
            <span>
              Your team logs AI experimentation time weekly via Slack
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
              2
            </span>
            <span>
              Our AI coach provides feedback and encouragement
            </span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-xs">
              3
            </span>
            <span>
              Promising experiments become formal initiatives
            </span>
          </li>
        </ul>
      </div>

      <button
        onClick={handleGetStarted}
        disabled={isSubmitting}
        className="rounded-lg bg-purple-600 px-6 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-50"
      >
        {isSubmitting ? "Setting up..." : "Get Started"}
      </button>
    </div>
  );
}
