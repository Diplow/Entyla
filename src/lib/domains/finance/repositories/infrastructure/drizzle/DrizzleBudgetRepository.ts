import { eq, and, lte, gte } from "drizzle-orm";

import { db, budget } from "~/server/db";
import type { BudgetRepository } from "../../BudgetRepository";
import type { Budget, BudgetCreateInput } from "../../../objects";

export class DrizzleBudgetRepository implements BudgetRepository {
  async create(input: BudgetCreateInput): Promise<Budget> {
    const [insertedBudget] = await db.insert(budget).values(input).returning();

    return insertedBudget!;
  }

  async findById(budgetId: number): Promise<Budget | null> {
    const foundBudget = await db.query.budget.findFirst({
      where: eq(budget.id, budgetId),
    });

    return foundBudget ?? null;
  }

  async findActiveByOrganization(
    organizationId: number,
  ): Promise<Budget | null> {
    const now = new Date();
    const foundBudget = await db.query.budget.findFirst({
      where: and(
        eq(budget.organizationId, organizationId),
        lte(budget.periodStart, now),
        gte(budget.periodEnd, now),
      ),
    });

    return foundBudget ?? null;
  }

  async findAllByOrganization(organizationId: number): Promise<Budget[]> {
    const budgets = await db.query.budget.findMany({
      where: eq(budget.organizationId, organizationId),
      orderBy: (budget, { desc }) => [desc(budget.periodStart)],
    });

    return budgets;
  }
}
