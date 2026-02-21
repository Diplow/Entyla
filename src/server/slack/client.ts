import { WebClient } from "@slack/web-api";
import { env } from "~/env";

let slackClientInstance: WebClient | null = null;

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
