import type {
  BudgetRepository,
  InitiativeRepository,
  TimeEntryRepository,
} from "../../../repositories";
import type { Budget, Initiative } from "../../../objects";
import type { BudgetSummary, InitiativeBurn, Signal, WeeklyTrendPoint } from "../objects";

const WEEKS_FOR_BURN_RATE = 4;
const STALE_WEEKS_THRESHOLD = 2;
const BUDGET_WARNING_THRESHOLD = 0.8;

export async function computeBudgetSummary(
  budgetRepository: BudgetRepository,
  timeEntryRepository: TimeEntryRepository,
  organizationId: number,
): Promise<BudgetSummary | null> {
  const activeBudget = await budgetRepository.findActiveByOrganization(
    organizationId,
  );

  if (!activeBudget) {
    return null;
  }

  const consumedPersonDays = await timeEntryRepository.sumByOrganizationAndPeriod(
    organizationId,
    activeBudget.periodStart,
    activeBudget.periodEnd,
  );

  const remainingPersonDays = activeBudget.totalPersonDays - consumedPersonDays;
  const burnRate = calculateBurnRate(activeBudget, consumedPersonDays);
  const forecastExhaustionDate = calculateForecastDate(
    activeBudget,
    remainingPersonDays,
    burnRate,
  );

  return {
    totalPersonDays: activeBudget.totalPersonDays,
    consumedPersonDays,
    remainingPersonDays,
    burnRate,
    forecastExhaustionDate,
  };
}

export async function computeBurnByInitiative(
  initiativeRepository: InitiativeRepository,
  timeEntryRepository: TimeEntryRepository,
  organizationId: number,
  periodStart: Date,
  periodEnd: Date,
): Promise<InitiativeBurn[]> {
  const initiatives = await initiativeRepository.findAllByOrganization(
    organizationId,
  );

  const burns: InitiativeBurn[] = [];

  for (const initiative of initiatives) {
    const personDaysConsumed = await timeEntryRepository.sumByInitiativeAndPeriod(
      initiative.id,
      periodStart,
      periodEnd,
    );

    burns.push({
      initiativeId: initiative.id,
      initiativeName: initiative.name,
      personDaysConsumed,
      isDefaultBucket: initiative.isDefaultBucket,
    });
  }

  return burns.sort((a, b) => b.personDaysConsumed - a.personDaysConsumed);
}

export async function computeSignals(
  budgetRepository: BudgetRepository,
  initiativeRepository: InitiativeRepository,
  timeEntryRepository: TimeEntryRepository,
  organizationId: number,
): Promise<Signal[]> {
  const signals: Signal[] = [];

  const pendingProposals = await initiativeRepository.findPendingByOrganization(
    organizationId,
  );
  for (const proposal of pendingProposals) {
    signals.push({
      type: "pending_proposal",
      initiativeId: proposal.id,
      message: `"${proposal.name}" is awaiting approval`,
    });
  }

  const activeBudget = await budgetRepository.findActiveByOrganization(
    organizationId,
  );
  if (activeBudget) {
    const consumed = await timeEntryRepository.sumByOrganizationAndPeriod(
      organizationId,
      activeBudget.periodStart,
      activeBudget.periodEnd,
    );

    const utilizationRate = consumed / activeBudget.totalPersonDays;
    if (utilizationRate >= BUDGET_WARNING_THRESHOLD) {
      signals.push({
        type: "budget_warning",
        message: `Budget is ${Math.round(utilizationRate * 100)}% consumed`,
      });
    }

    const initiatives = await initiativeRepository.findAllByOrganization(
      organizationId,
    );
    const staleInitiatives = await findStaleInitiatives(
      initiatives,
      timeEntryRepository,
    );

    for (const initiative of staleInitiatives) {
      signals.push({
        type: "stale_initiative",
        initiativeId: initiative.id,
        message: `"${initiative.name}" has had no activity for ${STALE_WEEKS_THRESHOLD}+ weeks`,
      });
    }
  }

  return signals;
}

export async function computeWeeklyTrend(
  initiativeRepository: InitiativeRepository,
  timeEntryRepository: TimeEntryRepository,
  organizationId: number,
  periodStart: Date,
  periodEnd: Date,
): Promise<WeeklyTrendPoint[]> {
  const initiatives = await initiativeRepository.findAllByOrganization(organizationId);
  const defaultBucketIds = new Set(
    initiatives.filter((initiative) => initiative.isDefaultBucket).map((initiative) => initiative.id),
  );

  const entries = await timeEntryRepository.findAllByOrganizationAndPeriod(
    organizationId,
    periodStart,
    periodEnd,
  );

  const weeklyData = new Map<string, { exploration: number; structured: number }>();

  for (const entry of entries) {
    const weekKey = entry.weekOf.toISOString();
    const current = weeklyData.get(weekKey) ?? { exploration: 0, structured: 0 };

    if (defaultBucketIds.has(entry.initiativeId)) {
      current.exploration += entry.personDays;
    } else {
      current.structured += entry.personDays;
    }

    weeklyData.set(weekKey, current);
  }

  const trendPoints: WeeklyTrendPoint[] = [];
  for (const [weekKey, data] of weeklyData) {
    trendPoints.push({
      weekOf: new Date(weekKey),
      explorationPersonDays: data.exploration,
      structuredPersonDays: data.structured,
      totalPersonDays: data.exploration + data.structured,
    });
  }

  return trendPoints.sort((a, b) => a.weekOf.getTime() - b.weekOf.getTime());
}

function calculateBurnRate(budget: Budget, consumedPersonDays: number): number {
  const now = new Date();
  const weeksSinceStart = Math.max(
    1,
    Math.floor(
      (now.getTime() - budget.periodStart.getTime()) / (7 * 24 * 60 * 60 * 1000),
    ),
  );

  return consumedPersonDays / Math.min(weeksSinceStart, WEEKS_FOR_BURN_RATE);
}

function calculateForecastDate(
  budget: Budget,
  remainingPersonDays: number,
  burnRate: number,
): Date | null {
  if (burnRate <= 0 || remainingPersonDays <= 0) {
    return null;
  }

  const weeksRemaining = remainingPersonDays / burnRate;
  const exhaustionDate = new Date();
  exhaustionDate.setDate(exhaustionDate.getDate() + weeksRemaining * 7);

  if (exhaustionDate > budget.periodEnd) {
    return null;
  }

  return exhaustionDate;
}

async function findStaleInitiatives(
  initiatives: Initiative[],
  timeEntryRepository: TimeEntryRepository,
): Promise<Initiative[]> {
  const staleInitiatives: Initiative[] = [];
  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - STALE_WEEKS_THRESHOLD * 7 * 24 * 60 * 60 * 1000);

  for (const initiative of initiatives) {
    if (initiative.isDefaultBucket) continue;
    if (initiative.status === "stopped" || initiative.status === "paused") continue;

    const entries = await timeEntryRepository.findAllByInitiative(initiative.id);
    const recentEntry = entries.find((entry) => entry.weekOf >= twoWeeksAgo);

    if (!recentEntry && entries.length > 0) {
      staleInitiatives.push(initiative);
    }
  }

  return staleInitiatives;
}
