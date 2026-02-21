import crypto from "crypto";
import { env } from "~/env";

export function verifySlackSignature(
  requestBody: string,
  slackSignature: string,
  slackTimestamp: string,
): boolean {
  const signingSecret = env.SLACK_SIGNING_SECRET;
  if (!signingSecret) {
    console.warn("SLACK_SIGNING_SECRET not configured");
    return false;
  }

  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (Number(slackTimestamp) < fiveMinutesAgo) {
    return false;
  }

  const sigBasestring = `v0:${slackTimestamp}:${requestBody}`;
  const expectedSignature = `v0=${crypto
    .createHmac("sha256", signingSecret)
    .update(sigBasestring)
    .digest("hex")}`;

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(slackSignature),
    );
  } catch {
    return false;
  }
}
