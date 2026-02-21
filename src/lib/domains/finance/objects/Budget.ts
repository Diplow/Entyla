export type BudgetId = number;

export interface Budget {
  id: BudgetId;
  organizationId: number;
  totalPersonDays: number;
  periodStart: Date;
  periodEnd: Date;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface BudgetCreateInput {
  organizationId: number;
  totalPersonDays: number;
  periodStart: Date;
  periodEnd: Date;
}
