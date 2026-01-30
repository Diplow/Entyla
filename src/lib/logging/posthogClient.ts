import { PostHog } from "posthog-node";

import { env } from "~/env";

let cachedClient: PostHog | null | undefined;

export function getPostHogClient(): PostHog | null {
  if (cachedClient !== undefined) return cachedClient;

  const apiKey = env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) {
    cachedClient = null;
    return null;
  }

  cachedClient = new PostHog(apiKey, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });

  process.on("beforeExit", () => {
    void cachedClient?.shutdown();
  });

  return cachedClient;
}

/** @deprecated Use getPostHogClient instead */
export const _getPostHogClient = getPostHogClient;
