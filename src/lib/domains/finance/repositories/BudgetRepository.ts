import type { Budget, BudgetCreateInput } from "../objects";

export interface BudgetRepository {
  create(input: BudgetCreateInput): Promise<Budget>;
  findById(budgetId: number): Promise<Budget | null>;
  findActiveByOrganization(organizationId: number): Promise<Budget | null>;
  findAllByOrganization(organizationId: number): Promise<Budget[]>;
}
