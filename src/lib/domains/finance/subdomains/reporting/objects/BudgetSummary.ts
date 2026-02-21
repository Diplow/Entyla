export interface BudgetSummary {
  totalPersonDays: number;
  consumedPersonDays: number;
  remainingPersonDays: number;
  burnRate: number;
  forecastExhaustionDate: Date | null;
}
