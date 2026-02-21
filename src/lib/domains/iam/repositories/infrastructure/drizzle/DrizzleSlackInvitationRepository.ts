import crypto from "crypto";
import { eq, and } from "drizzle-orm";

import { db, slackInvitation } from "~/server/db";
import type { SlackInvitationRepository } from "../../SlackInvitationRepository";
import type { SlackInvitation } from "../../../objects";

const INVITATION_EXPIRY_DAYS = 7;

export class DrizzleSlackInvitationRepository
  implements SlackInvitationRepository
{
  async create(
    slackUserId: string,
    slackTeamId: string,
    organizationId: number | null,
  ): Promise<SlackInvitation> {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const [inserted] = await db
      .insert(slackInvitation)
      .values({
        token,
        slackUserId,
        slackTeamId,
        organizationId,
        expiresAt,
      })
      .onConflictDoUpdate({
        target: [slackInvitation.slackUserId, slackInvitation.slackTeamId],
        set: {
          token,
          organizationId,
          expiresAt,
          usedAt: null,
        },
      })
      .returning();

    return inserted!;
  }

  async findByToken(token: string): Promise<SlackInvitation | null> {
    const found = await db.query.slackInvitation.findFirst({
      where: eq(slackInvitation.token, token),
    });
    return found ?? null;
  }

  async findBySlackUser(
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackInvitation | null> {
    const found = await db.query.slackInvitation.findFirst({
      where: and(
        eq(slackInvitation.slackUserId, slackUserId),
        eq(slackInvitation.slackTeamId, slackTeamId),
      ),
    });
    return found ?? null;
  }

  async markUsed(id: number): Promise<void> {
    await db
      .update(slackInvitation)
      .set({ usedAt: new Date() })
      .where(eq(slackInvitation.id, id));
  }
}
