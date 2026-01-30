"use client";

import posthog from "posthog-js";

import { authClient } from "~/lib/auth-client";

export function SignInButton() {
  function handleSignIn() {
    posthog.capture("sign_in_clicked", {
      provider: "google",
    });
    void authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }

  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      onClick={handleSignIn}
    >
      Sign in with Google
    </button>
  );
}
