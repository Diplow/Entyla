import { FinanceService as _FinanceService } from "./services";
import { ReportingService as _ReportingService } from "./subdomains";
import { withLogging } from "~/lib/logging";

export const FinanceService = withLogging("FinanceService", _FinanceService);
export const ReportingService = withLogging("ReportingService", _ReportingService);

export type {
  Budget,
  BudgetId,
  BudgetCreateInput,
  Initiative,
  InitiativeId,
  InitiativeStatus,
  InitiativeCreateInput,
  InitiativeUpdateInput,
  TimeEntry,
  TimeEntryId,
  TimeEntryCreateInput,
} from "./objects";

export type {
  BudgetSummary,
  InitiativeBurn,
  Signal,
  SignalType,
  WeeklyTrendPoint,
} from "./subdomains";
