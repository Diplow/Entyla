import type { SlackUserMapping } from "../objects";

export interface SlackUserMappingRepository {
  findByUserId(userId: string): Promise<SlackUserMapping | null>;
  findBySlackUserId(
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackUserMapping | null>;
  create(
    userId: string,
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackUserMapping>;
  findAllByOrganization(organizationId: number): Promise<SlackUserMapping[]>;
}
