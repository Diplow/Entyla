import type { TimeEntryRepository } from "../repositories";
import type { TimeEntry } from "../objects";

export async function logTime(
  repository: TimeEntryRepository,
  userId: string,
  initiativeId: number,
  personDays: number,
  weekOf: Date,
  note: string | null,
): Promise<TimeEntry> {
  return repository.create({
    userId,
    initiativeId,
    personDays,
    weekOf,
    note,
  });
}

export async function getTimeEntriesByInitiative(
  repository: TimeEntryRepository,
  initiativeId: number,
): Promise<TimeEntry[]> {
  return repository.findAllByInitiative(initiativeId);
}

export async function getTimeEntriesByOrganization(
  repository: TimeEntryRepository,
  organizationId: number,
  periodStart: Date,
  periodEnd: Date,
): Promise<TimeEntry[]> {
  return repository.findAllByOrganizationAndPeriod(
    organizationId,
    periodStart,
    periodEnd,
  );
}

export async function getRecentTimeEntriesByUser(
  repository: TimeEntryRepository,
  userId: string,
  weeksBack: number,
): Promise<TimeEntry[]> {
  return repository.findRecentByUser(userId, weeksBack);
}
