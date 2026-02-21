import { IamService } from "~/lib/domains/iam";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

async function handleGetOnboardingStatus() {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // For POC, onboarding is considered completed once user has logged in
  // In future, this could check for Slack connection or other setup steps
  return Response.json({ completed: true, hasCompanyKnowledge: false });
}

const handlers = withApiLogging(
  "/api/onboarding",
  { GET: handleGetOnboardingStatus },
  resolveSessionUserId,
);

export const { GET } = handlers;
