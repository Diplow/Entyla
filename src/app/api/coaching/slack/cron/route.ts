import { z } from "zod";

import { env } from "~/env";
import { IamService } from "~/lib/domains/iam";
import { CoachingService } from "~/lib/domains/coaching";
import { sendSlackDirectMessage } from "~/server/slack";
import { buildCoachingContext, getStartOfCurrentWeek } from "../../buildContext";

const cronBodySchema = z.object({
  organizationId: z.number(),
});

interface CronResult {
  slackUserId: string;
  status: "sent" | "error";
  error?: string;
}

export async function POST(request: Request): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  if (!env.CRON_SECRET || authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parseResult = cronBodySchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json(
      { error: parseResult.error.flatten() },
      { status: 400 },
    );
  }

  const { organizationId } = parseResult.data;
  const slackMappings = await IamService.getOrgMembersWithSlack(organizationId);
  const weekOf = getStartOfCurrentWeek();

  const results: CronResult[] = [];

  for (const mapping of slackMappings) {
    try {
      const context = await buildCoachingContext(
        mapping.userId,
        "User",
        organizationId,
        weekOf,
      );

      const sessionResult = await CoachingService.initiateSession(
        mapping.userId,
        organizationId,
        weekOf,
        context,
      );

      await sendSlackDirectMessage(
        mapping.slackUserId,
        sessionResult.initiationMessage,
      );

      results.push({ slackUserId: mapping.slackUserId, status: "sent" });
    } catch (error) {
      results.push({
        slackUserId: mapping.slackUserId,
        status: "error",
        error: String(error),
      });
    }
  }

  return Response.json({
    sent: results.filter((r) => r.status === "sent").length,
    errors: results.filter((r) => r.status === "error").length,
    results,
  });
}
