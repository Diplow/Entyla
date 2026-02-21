import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { IamService } from "~/lib/domains/iam";
import { env } from "~/env";

const SLACK_LINK_COOKIE = "slack_link_token";
const COOKIE_MAX_AGE_SECONDS = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  const baseUrl = env.BETTER_AUTH_URL;

  const invitation = await IamService.getSlackInvitationByToken(token);

  if (!invitation) {
    return new Response("Invalid or expired link", { status: 400 });
  }

  if (invitation.usedAt) {
    return NextResponse.redirect(new URL("/?slackLinked=already", baseUrl));
  }

  if (invitation.expiresAt < new Date()) {
    return new Response("This link has expired. Please request a new one.", {
      status: 400,
    });
  }

  const currentUser = await IamService.getCurrentUser();

  if (!currentUser) {
    const cookieStore = await cookies();
    cookieStore.set(SLACK_LINK_COOKIE, token, {
      maxAge: COOKIE_MAX_AGE_SECONDS,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return NextResponse.redirect(new URL("/?slackLink=pending", baseUrl));
  }

  try {
    await IamService.completeSlackInvitation(token, currentUser.id);

    const cookieStore = await cookies();
    cookieStore.delete(SLACK_LINK_COOKIE);

    return NextResponse.redirect(new URL("/?slackLinked=success", baseUrl));
  } catch (error) {
    console.error("Failed to complete Slack invitation:", error);
    return new Response("Failed to link Slack account", { status: 500 });
  }
}
