import {
  DrizzleBudgetRepository,
  DrizzleInitiativeRepository,
  DrizzleTimeEntryRepository,
} from "../repositories";
import {
  createBudget,
  getActiveBudget,
  getBudgetHistory,
  createDefaultInitiative,
  proposeInitiative,
  approveInitiative,
  rejectInitiative,
  pauseInitiative,
  listInitiatives,
  listPendingProposals,
  logTime,
  getTimeEntriesByInitiative,
  getRecentTimeEntriesByUser,
} from "../actions";
import type { BudgetCreateInput } from "../objects";

const budgetRepository = new DrizzleBudgetRepository();
const initiativeRepository = new DrizzleInitiativeRepository();
const timeEntryRepository = new DrizzleTimeEntryRepository();

export const FinanceService = {
  // Budget
  createBudget: (input: BudgetCreateInput) =>
    createBudget(budgetRepository, input),

  getActiveBudget: (organizationId: number) =>
    getActiveBudget(budgetRepository, organizationId),

  getBudgetHistory: (organizationId: number) =>
    getBudgetHistory(budgetRepository, organizationId),

  // Initiative
  createDefaultInitiative: (organizationId: number) =>
    createDefaultInitiative(initiativeRepository, organizationId),

  proposeInitiative: (
    organizationId: number,
    userId: string,
    name: string,
    description: string | null,
  ) => proposeInitiative(initiativeRepository, organizationId, userId, name, description),

  approveInitiative: (
    initiativeId: number,
    organizationId: number,
    adminUserId: string,
  ) => approveInitiative(initiativeRepository, initiativeId, organizationId, adminUserId),

  rejectInitiative: (initiativeId: number, organizationId: number) =>
    rejectInitiative(initiativeRepository, initiativeId, organizationId),

  pauseInitiative: (initiativeId: number, organizationId: number) =>
    pauseInitiative(initiativeRepository, initiativeId, organizationId),

  listInitiatives: (organizationId: number) =>
    listInitiatives(initiativeRepository, organizationId),

  listPendingProposals: (organizationId: number) =>
    listPendingProposals(initiativeRepository, organizationId),

  // Time Entry
  logTime: (
    userId: string,
    initiativeId: number,
    personDays: number,
    weekOf: Date,
    note: string | null,
  ) => logTime(timeEntryRepository, userId, initiativeId, personDays, weekOf, note),

  getTimeEntriesByInitiative: (initiativeId: number) =>
    getTimeEntriesByInitiative(timeEntryRepository, initiativeId),

  getRecentTimeEntriesByUser: (userId: string, weeksBack: number) =>
    getRecentTimeEntriesByUser(timeEntryRepository, userId, weeksBack),
};
