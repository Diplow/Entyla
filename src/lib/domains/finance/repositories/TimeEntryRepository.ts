import type { TimeEntry, TimeEntryCreateInput } from "../objects";

export interface TimeEntryRepository {
  create(input: TimeEntryCreateInput): Promise<TimeEntry>;
  upsertAdditive(input: TimeEntryCreateInput): Promise<TimeEntry>;
  findByUserAndWeek(
    userId: string,
    initiativeId: number,
    weekOf: Date,
  ): Promise<TimeEntry | null>;
  findAllByInitiative(initiativeId: number): Promise<TimeEntry[]>;
  findAllByOrganizationAndPeriod(
    organizationId: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<TimeEntry[]>;
  sumByInitiativeAndPeriod(
    initiativeId: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number>;
  sumByOrganizationAndPeriod(
    organizationId: number,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<number>;
  findRecentByUser(userId: string, weeksBack: number): Promise<TimeEntry[]>;
}
