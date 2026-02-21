import { verifySlackSignature, sendSlackDirectMessage } from "~/server/slack";
import { IamService } from "~/lib/domains/iam";
import { CoachingService, type UserReport } from "~/lib/domains/coaching";
import { buildCoachingContext, getStartOfCurrentWeek } from "../../buildContext";

interface SlackEvent {
  type: string;
  user?: string;
  text?: string;
  bot_id?: string;
  subtype?: string;
}

interface SlackEventPayload {
  type: string;
  challenge?: string;
  team_id?: string;
  event?: SlackEvent;
}

function parseSlackMessageAsReport(messageText: string): UserReport {
  return {
    entries: [],
    freeformNote: messageText,
  };
}

export async function POST(request: Request): Promise<Response> {
  const rawBody = await request.text();
  const slackSignature = request.headers.get("x-slack-signature") ?? "";
  const slackTimestamp = request.headers.get("x-slack-request-timestamp") ?? "";

  if (!verifySlackSignature(rawBody, slackSignature, slackTimestamp)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as SlackEventPayload;

  if (payload.type === "url_verification") {
    return Response.json({ challenge: payload.challenge });
  }

  if (payload.type === "event_callback" && payload.event?.type === "message") {
    const slackEvent = payload.event;

    if (slackEvent.bot_id || slackEvent.subtype) {
      return Response.json({ ok: true });
    }

    const slackUserId = slackEvent.user;
    const slackTeamId = payload.team_id;
    const messageText = slackEvent.text;

    if (!slackUserId || !slackTeamId || !messageText) {
      return Response.json({ ok: true });
    }

    const slackMapping = await IamService.getUserBySlackId(
      slackUserId,
      slackTeamId,
    );
    if (!slackMapping) {
      await sendSlackDirectMessage(
        slackUserId,
        "I don't recognize your Slack account. Please link it in the dashboard first.",
      );
      return Response.json({ ok: true });
    }

    const userId = slackMapping.userId;
    const organization = await IamService.getCurrentOrganization(userId);
    if (!organization) {
      await sendSlackDirectMessage(
        slackUserId,
        "You don't seem to be part of an organization yet.",
      );
      return Response.json({ ok: true });
    }

    const weekOf = getStartOfCurrentWeek();
    const context = await buildCoachingContext(
      userId,
      "User",
      organization.id,
      weekOf,
    );

    const sessionResult = await CoachingService.initiateSession(
      userId,
      organization.id,
      weekOf,
      context,
    );

    const report = parseSlackMessageAsReport(messageText);
    const result = await CoachingService.respondToReport(
      sessionResult.session.id,
      report,
      context,
    );

    await sendSlackDirectMessage(slackUserId, result.feedbackMessage);
    return Response.json({ ok: true });
  }

  return Response.json({ ok: true });
}
