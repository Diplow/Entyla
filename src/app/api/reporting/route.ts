import { IamService } from "~/lib/domains/iam";
import { FinanceService, ReportingService } from "~/lib/domains/finance";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

async function handleGetReporting() {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organization = await IamService.getCurrentOrganization(currentUser.id);
  if (!organization) {
    return Response.json({ error: "No organization found" }, { status: 404 });
  }

  const activeBudget = await FinanceService.getActiveBudget(organization.id);

  const periodStart = activeBudget?.periodStart ?? getDefaultPeriodStart();
  const periodEnd = activeBudget?.periodEnd ?? getDefaultPeriodEnd();

  const [budgetSummary, burnByInitiative, weeklyTrend, signals, initiatives] =
    await Promise.all([
      ReportingService.getBudgetSummary(organization.id),
      ReportingService.getBurnByInitiative(organization.id, periodStart, periodEnd),
      ReportingService.getWeeklyTrend(organization.id, periodStart, periodEnd),
      ReportingService.getSignals(organization.id),
      FinanceService.listInitiatives(organization.id),
    ]);

  return Response.json({
    budgetSummary,
    burnByInitiative,
    weeklyTrend,
    signals,
    initiatives,
  });
}

function getDefaultPeriodStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getDefaultPeriodEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
}

const handlers = withApiLogging(
  "/api/reporting",
  { GET: handleGetReporting },
  resolveSessionUserId,
);

export const { GET } = handlers;
