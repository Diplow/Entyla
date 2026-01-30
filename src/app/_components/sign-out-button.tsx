"use client";

import { useRouter } from "next/navigation";
import posthog from "posthog-js";

import { authClient } from "~/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    posthog.capture("sign_out_clicked");
    await authClient.signOut();
    posthog.reset();
    router.refresh();
  }

  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      onClick={handleSignOut}
    >
      Sign out
    </button>
  );
}
