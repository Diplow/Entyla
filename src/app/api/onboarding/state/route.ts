import { IamService } from "~/lib/domains/iam";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

async function handleGetOnboardingState() {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For POC, onboarding is considered completed once user has logged in
  return Response.json({
    currentUser: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
    },
    isOnboardingCompleted: true,
  });
}

const handlers = withApiLogging(
  "/api/onboarding/state",
  { GET: handleGetOnboardingState },
  resolveSessionUserId,
);

export const { GET } = handlers;
