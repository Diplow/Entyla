import { eq, and, inArray } from "drizzle-orm";

import { db, slackUserMapping, membership } from "~/server/db";
import type { SlackUserMappingRepository } from "../../SlackUserMappingRepository";
import type { SlackUserMapping } from "../../../objects";

export class DrizzleSlackUserMappingRepository
  implements SlackUserMappingRepository
{
  async findByUserId(userId: string): Promise<SlackUserMapping | null> {
    const found = await db.query.slackUserMapping.findFirst({
      where: eq(slackUserMapping.userId, userId),
    });
    return found ?? null;
  }

  async findBySlackUserId(
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackUserMapping | null> {
    const found = await db.query.slackUserMapping.findFirst({
      where: and(
        eq(slackUserMapping.slackUserId, slackUserId),
        eq(slackUserMapping.slackTeamId, slackTeamId),
      ),
    });
    return found ?? null;
  }

  async create(
    userId: string,
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackUserMapping> {
    const [inserted] = await db
      .insert(slackUserMapping)
      .values({ userId, slackUserId, slackTeamId })
      .returning();
    return inserted!;
  }

  async findAllByOrganization(
    organizationId: number,
  ): Promise<SlackUserMapping[]> {
    const membershipRows = await db.query.membership.findMany({
      where: eq(membership.organizationId, organizationId),
    });
    const userIds = membershipRows.map((m) => m.userId);
    if (userIds.length === 0) return [];

    return db.query.slackUserMapping.findMany({
      where: inArray(slackUserMapping.userId, userIds),
    });
  }
}
