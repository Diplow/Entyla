import {
  DrizzleBudgetRepository,
  DrizzleInitiativeRepository,
  DrizzleTimeEntryRepository,
} from "../../../repositories";
import {
  computeBudgetSummary,
  computeBurnByInitiative,
  computeSignals,
  computeWeeklyTrend,
} from "../actions";

const budgetRepository = new DrizzleBudgetRepository();
const initiativeRepository = new DrizzleInitiativeRepository();
const timeEntryRepository = new DrizzleTimeEntryRepository();

export const ReportingService = {
  getBudgetSummary: (organizationId: number) =>
    computeBudgetSummary(budgetRepository, timeEntryRepository, organizationId),

  getBurnByInitiative: (
    organizationId: number,
    periodStart: Date,
    periodEnd: Date,
  ) =>
    computeBurnByInitiative(
      initiativeRepository,
      timeEntryRepository,
      organizationId,
      periodStart,
      periodEnd,
    ),

  getSignals: (organizationId: number) =>
    computeSignals(
      budgetRepository,
      initiativeRepository,
      timeEntryRepository,
      organizationId,
    ),

  getWeeklyTrend: (
    organizationId: number,
    periodStart: Date,
    periodEnd: Date,
  ) =>
    computeWeeklyTrend(
      initiativeRepository,
      timeEntryRepository,
      organizationId,
      periodStart,
      periodEnd,
    ),
};
