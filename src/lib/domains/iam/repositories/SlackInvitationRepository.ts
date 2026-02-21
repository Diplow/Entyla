import type { SlackInvitation } from "../objects";

export interface SlackInvitationRepository {
  create(
    slackUserId: string,
    slackTeamId: string,
    organizationId: number | null,
  ): Promise<SlackInvitation>;
  findByToken(token: string): Promise<SlackInvitation | null>;
  findBySlackUser(
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackInvitation | null>;
  markUsed(id: number): Promise<void>;
}
