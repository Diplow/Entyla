import { FinanceService } from "~/lib/domains/finance";
import type { Initiative, TimeEntry } from "~/lib/domains/finance";
import {
  CoachingService,
  type CoachingContext,
  type InitiativeSummary,
  type TimeEntrySummary,
} from "~/lib/domains/coaching";

function mapInitiativeToSummary(initiative: Initiative): InitiativeSummary {
  return {
    id: initiative.id,
    name: initiative.name,
    description: initiative.description,
    status: initiative.status,
    isDefaultBucket: initiative.isDefaultBucket,
  };
}

function mapTimeEntryToSummary(
  entry: TimeEntry,
  initiativeName: string,
): TimeEntrySummary {
  return {
    initiativeId: entry.initiativeId,
    initiativeName,
    personDays: entry.personDays,
    weekOf: entry.weekOf,
    note: entry.note,
  };
}

export async function buildCoachingContext(
  userId: string,
  userName: string,
  organizationId: number,
  currentWeekOf?: Date,
): Promise<CoachingContext> {
  const [initiatives, timeEntries, previousMessages] = await Promise.all([
    FinanceService.listInitiatives(organizationId),
    FinanceService.getRecentTimeEntriesByUser(userId, 4),
    CoachingService.getRecentMessages(userId, 4),
  ]);

  const initiativeMap = new Map(
    initiatives.map((initiative) => [initiative.id, initiative.name]),
  );

  const recentTimeEntries = timeEntries.map((entry) =>
    mapTimeEntryToSummary(
      entry,
      initiativeMap.get(entry.initiativeId) ?? "Unknown",
    ),
  );

  let currentWeekEntries: TimeEntrySummary[] = [];
  if (currentWeekOf) {
    const currentWeekStart = new Date(currentWeekOf);
    currentWeekStart.setHours(0, 0, 0, 0);
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

    currentWeekEntries = recentTimeEntries.filter(
      (entry) =>
        entry.weekOf >= currentWeekStart && entry.weekOf < currentWeekEnd,
    );
  }

  return {
    userName,
    initiatives: initiatives.map(mapInitiativeToSummary),
    recentTimeEntries,
    currentWeekEntries,
    previousMessages,
  };
}

export function getStartOfCurrentWeek(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
