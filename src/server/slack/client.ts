import { WebClient } from "@slack/web-api";
import { env } from "~/env";

let slackClientInstance: WebClient | null = null;

export interface SlackMember {
  id: string;
  name: string;
  realName: string | undefined;
  email: string | undefined;
}

export function getSlackClient(): WebClient {
  if (!slackClientInstance) {
    if (!env.SLACK_BOT_TOKEN) {
      throw new Error("SLACK_BOT_TOKEN is not configured");
    }
    slackClientInstance = new WebClient(env.SLACK_BOT_TOKEN);
  }
  return slackClientInstance;
}

export async function sendSlackDirectMessage(
  slackUserId: string,
  messageText: string,
): Promise<void> {
  const slackClient = getSlackClient();

  const conversationResult = await slackClient.conversations.open({
    users: slackUserId,
  });

  const channelId = conversationResult.channel?.id;
  if (!channelId) {
    throw new Error("Failed to open DM channel");
  }

  await slackClient.chat.postMessage({
    channel: channelId,
    text: messageText,
  });
}

export async function getSlackWorkspaceMembers(): Promise<SlackMember[]> {
  const slackClient = getSlackClient();
  const result = await slackClient.users.list({ limit: 200 });

  const members: SlackMember[] = [];
  for (const member of result.members ?? []) {
    if (member.is_bot || member.deleted || !member.id || !member.name) {
      continue;
    }
    members.push({
      id: member.id,
      name: member.name,
      realName: member.real_name,
      email: member.profile?.email,
    });
  }

  return members;
}

export async function postSlackResponse(
  responseUrl: string,
  text: string,
  replaceOriginal = false,
): Promise<void> {
  await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      replace_original: replaceOriginal,
      response_type: "ephemeral",
    }),
  });
}
