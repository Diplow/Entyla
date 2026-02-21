import type { BudgetRepository } from "../repositories";
import type { BudgetCreateInput } from "../objects";

export async function createBudget(
  repository: BudgetRepository,
  input: BudgetCreateInput,
) {
  return repository.create(input);
}

export async function getActiveBudget(
  repository: BudgetRepository,
  organizationId: number,
) {
  return repository.findActiveByOrganization(organizationId);
}

export async function getBudgetHistory(
  repository: BudgetRepository,
  organizationId: number,
) {
  return repository.findAllByOrganization(organizationId);
}
