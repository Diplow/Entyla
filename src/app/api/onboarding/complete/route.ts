import { IamService } from "~/lib/domains/iam";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

async function handleCompleteOnboarding() {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For POC, onboarding completion is a no-op
  // In future, this could set up default initiatives, Slack connection, etc.
  return Response.json({ success: true });
}

const handlers = withApiLogging(
  "/api/onboarding/complete",
  { POST: handleCompleteOnboarding },
  resolveSessionUserId,
);

export const { POST } = handlers;
