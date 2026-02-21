export interface SlackInvitation {
  id: number;
  token: string;
  slackUserId: string;
  slackTeamId: string;
  organizationId: number | null;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}
