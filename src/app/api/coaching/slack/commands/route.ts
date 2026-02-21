import { verifySlackSignature, postSlackResponse } from "~/server/slack";
import { IamService } from "~/lib/domains/iam";
import { FinanceService, type Initiative } from "~/lib/domains/finance";
import { CoachingService, type UserReport } from "~/lib/domains/coaching";
import { buildCoachingContext, getStartOfCurrentWeek } from "../../buildContext";
import { parseReportCommand, type ParsedReport } from "./parseReportCommand";

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const slackSignature = request.headers.get("x-slack-signature") ?? "";
  const slackTimestamp =
    request.headers.get("x-slack-request-timestamp") ?? "";

  if (!verifySlackSignature(rawBody, slackSignature, slackTimestamp)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const formData = new URLSearchParams(rawBody);
  const slackUserId = formData.get("user_id");
  const slackTeamId = formData.get("team_id");
  const commandText = formData.get("text") ?? "";
  const responseUrl = formData.get("response_url") ?? "";

  if (!slackUserId || !slackTeamId) {
    return Response.json({ text: "Invalid request" });
  }

  const slackMapping = await IamService.getUserBySlackId(
    slackUserId,
    slackTeamId,
  );
  if (!slackMapping) {
    return Response.json({
      response_type: "ephemeral",
      text: "Please link your Slack account first by messaging me directly.",
    });
  }

  const userId = slackMapping.userId;
  const organization = await IamService.getCurrentOrganization(userId);
  if (!organization) {
    return Response.json({
      response_type: "ephemeral",
      text: "You're not part of an organization yet.",
    });
  }

  const parsed = parseReportCommand(commandText);
  if ("error" in parsed) {
    return Response.json({
      response_type: "ephemeral",
      text: parsed.error,
    });
  }

  const initiatives = await FinanceService.listInitiatives(organization.id);
  const initiative = initiatives.find(
    (i) => i.name.toLowerCase() === parsed.initiativeName.toLowerCase(),
  );
  if (!initiative) {
    const available = initiatives.map((i) => `"${i.name}"`).join(", ");
    return Response.json({
      response_type: "ephemeral",
      text: `Initiative "${parsed.initiativeName}" not found.\n\nAvailable initiatives: ${available}`,
    });
  }

  void processReportAsync(
    userId,
    organization.id,
    initiative,
    parsed,
    responseUrl,
  );

  return Response.json({
    response_type: "ephemeral",
    text: `Logging ${parsed.personDays}d on "${initiative.name}"...`,
  });
}

async function processReportAsync(
  userId: string,
  organizationId: number,
  initiative: Initiative,
  parsed: ParsedReport,
  responseUrl: string,
): Promise<void> {
  try {
    const weekOf = getStartOfCurrentWeek();

    await FinanceService.addTimeToInitiative(
      userId,
      initiative.id,
      parsed.personDays,
      weekOf,
      parsed.note,
    );

    const context = await buildCoachingContext(
      userId,
      "User",
      organizationId,
      weekOf,
    );

    const report: UserReport = {
      entries: [
        {
          initiativeName: initiative.name,
          personDays: parsed.personDays,
          note: parsed.note,
        },
      ],
      freeformNote: null,
    };

    const session = await CoachingService.initiateSession(
      userId,
      organizationId,
      weekOf,
      context,
    );
    const result = await CoachingService.respondToReport(
      session.session.id,
      report,
      context,
    );

    await postSlackResponse(responseUrl, result.feedbackMessage);
  } catch (error) {
    console.error("Error processing report:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";
    await postSlackResponse(
      responseUrl,
      `Failed to log time: ${errorMessage}`,
    );
  }
}
