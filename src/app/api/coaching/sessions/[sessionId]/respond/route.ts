import { z } from "zod";

import { IamService } from "~/lib/domains/iam";
import { FinanceService } from "~/lib/domains/finance";
import type { Initiative, TimeEntry } from "~/lib/domains/finance";
import {
  CoachingService,
  type CoachingContext,
  type InitiativeSummary,
  type TimeEntrySummary,
  type UserReport,
} from "~/lib/domains/coaching";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

const reportEntrySchema = z.object({
  initiativeName: z.string().min(1),
  personDays: z.number().min(0).max(7),
  note: z.string().nullable(),
});

const respondSchema = z.object({
  entries: z.array(reportEntrySchema),
  freeformNote: z.string().nullable(),
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
    mapTimeEntryToSummary(entry, initiativeMap.get(entry.initiativeId) ?? "Unknown"),
  );

  return {
    userName,
    initiatives: initiatives.map(mapInitiativeToSummary),
    recentTimeEntries,
    currentWeekEntries: [],
    previousMessages,
  };
}

const handlers = withApiLogging(
  "/api/coaching/sessions/[sessionId]/respond",
  {
    POST: async (
      request: Request,
      { params }: { params: Promise<{ sessionId: string }> },
    ) => {
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

      const { sessionId: sessionIdParam } = await params;
      const sessionId = Number(sessionIdParam);
      if (Number.isNaN(sessionId)) {
        return Response.json({ error: "Invalid sessionId" }, { status: 400 });
      }

      const body: unknown = await request.json();
      const parseResult = respondSchema.safeParse(body);
      if (!parseResult.success) {
        return Response.json(
          { error: parseResult.error.flatten() },
          { status: 400 },
        );
      }

      const report: UserReport = {
        entries: parseResult.data.entries,
        freeformNote: parseResult.data.freeformNote,
      };

      const context = await buildCoachingContext(
        currentUser.id,
        currentUser.name,
        organization.id,
      );

      const result = await CoachingService.respondToReport(
        sessionId,
        report,
        context,
      );

      return Response.json(result);
    },
  },
  resolveSessionUserId,
);

export const { POST } = handlers;
