import { cookies } from "next/headers";

import { IamService } from "~/lib/domains/iam";

const SLACK_LINK_COOKIE = "slack_link_token";

export async function POST(): Promise<Response> {
  const currentUser = await IamService.getCurrentUser();
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(SLACK_LINK_COOKIE)?.value;

  if (!token) {
    return Response.json({ error: "No pending Slack link" }, { status: 400 });
  }

  try {
    await IamService.completeSlackInvitation(token, currentUser.id);
    cookieStore.delete(SLACK_LINK_COOKIE);
    return Response.json({ success: true });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to link Slack account";
    return Response.json({ error: errorMessage }, { status: 400 });
  }
}

export async function GET(): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SLACK_LINK_COOKIE)?.value;
  return Response.json({ hasPendingLink: !!token });
}
