import { z } from "zod";

import { IamService } from "~/lib/domains/iam";
import { FinanceService } from "~/lib/domains/finance";
import type { Initiative, TimeEntry } from "~/lib/domains/finance";
import {
  CoachingService,
  type CoachingContext,
  type InitiativeSummary,
  type TimeEntrySummary,
} from "~/lib/domains/coaching";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

const initiateSessionSchema = z.object({
  weekOf: z.string().datetime(),
});

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

async function buildCoachingContext(
  userId: string,
  userName: string,
  organizationId: number,
  currentWeekOf: Date,
): Promise<CoachingContext> {
  const [initiatives, timeEntries, previousMessages] = await Promise.all([
    FinanceService.listInitiatives(organizationId),
    FinanceService.getRecentTimeEntriesByUser(userId, 4),
    CoachingService.getRecentMessages(userId, 4),
  ]);

  // Build initiative name lookup
  const initiativeMap = new Map(
    initiatives.map((initiative) => [initiative.id, initiative.name]),
  );

  // Map time entries to summaries
  const recentTimeEntries = timeEntries.map((entry) =>
    mapTimeEntryToSummary(entry, initiativeMap.get(entry.initiativeId) ?? "Unknown"),
  );

  // Filter for current week entries
  const currentWeekStart = new Date(currentWeekOf);
  currentWeekStart.setHours(0, 0, 0, 0);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekEnd.getDate() + 7);

  const currentWeekEntries = recentTimeEntries.filter(
    (entry) => entry.weekOf >= currentWeekStart && entry.weekOf < currentWeekEnd,
  );

  return {
    userName,
    initiatives: initiatives.map(mapInitiativeToSummary),
    recentTimeEntries,
    currentWeekEntries,
    previousMessages,
  };
}

const handlers = withApiLogging(
  "/api/coaching/sessions",
  {
    GET: async (request: Request) => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { searchParams } = new URL(request.url);
      const weeksBackParam = searchParams.get("weeksBack");
      const weeksBack = weeksBackParam ? Number(weeksBackParam) : 4;

      if (Number.isNaN(weeksBack) || weeksBack < 1 || weeksBack > 52) {
        return Response.json(
          { error: "weeksBack must be a number between 1 and 52" },
          { status: 400 },
        );
      }

      const sessions = await CoachingService.getSessionHistory(
        currentUser.id,
        weeksBack,
      );

      return Response.json(sessions);
    },

    POST: async (request: Request) => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const organization = await IamService.getCurrentOrganization(currentUser.id);
      if (!organization) {
        return Response.json(
          { error: "User has no organization" },
          { status: 404 },
        );
      }

      const body: unknown = await request.json();
      const parseResult = initiateSessionSchema.safeParse(body);
      if (!parseResult.success) {
        return Response.json(
          { error: parseResult.error.flatten() },
          { status: 400 },
        );
      }

      const weekOf = new Date(parseResult.data.weekOf);

      const context = await buildCoachingContext(
        currentUser.id,
        currentUser.name,
        organization.id,
        weekOf,
      );

      const result = await CoachingService.initiateSession(
        currentUser.id,
        organization.id,
        weekOf,
        context,
      );

      return Response.json(result, { status: 201 });
    },
  },
  resolveSessionUserId,
);

export const { GET, POST } = handlers;
