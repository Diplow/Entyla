import {
  BetterAuthUserRepository,
  DrizzleMembershipRepository,
  DrizzleSlackUserMappingRepository,
  DrizzleSlackInvitationRepository,
} from "../repositories";
import type {
  User,
  Organization,
  Membership,
  MemberRole,
  SlackUserMapping,
  SlackInvitation,
} from "../objects";

const userRepository = new BetterAuthUserRepository();
const membershipRepository = new DrizzleMembershipRepository();
const slackMappingRepository = new DrizzleSlackUserMappingRepository();
const slackInvitationRepository = new DrizzleSlackInvitationRepository();

export const IamService = {
  getCurrentUser: (): Promise<User | null> => userRepository.getCurrentUser(),

  getCurrentOrganization: (userId: string): Promise<Organization | null> =>
    membershipRepository.findOrganizationByUser(userId),

  getUserMembership: (userId: string): Promise<Membership | null> =>
    membershipRepository.findByUser(userId),

  getUserRole: async (userId: string): Promise<MemberRole | null> => {
    const membership = await membershipRepository.findByUser(userId);
    return membership?.role ?? null;
  },

  isAdmin: async (userId: string): Promise<boolean> => {
    const membership = await membershipRepository.findByUser(userId);
    return membership?.role === "admin";
  },

  getUserBySlackId: (
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackUserMapping | null> =>
    slackMappingRepository.findBySlackUserId(slackUserId, slackTeamId),

  linkSlackUser: (
    userId: string,
    slackUserId: string,
    slackTeamId: string,
  ): Promise<SlackUserMapping> =>
    slackMappingRepository.create(userId, slackUserId, slackTeamId),

  getOrgMembersWithSlack: (
    organizationId: number,
  ): Promise<SlackUserMapping[]> =>
    slackMappingRepository.findAllByOrganization(organizationId),

  createSlackInvitation: (
    slackUserId: string,
    slackTeamId: string,
    organizationId: number | null,
  ): Promise<SlackInvitation> =>
    slackInvitationRepository.create(slackUserId, slackTeamId, organizationId),

  getSlackInvitationByToken: (
    token: string,
  ): Promise<SlackInvitation | null> =>
    slackInvitationRepository.findByToken(token),

  getOrCreateSlackInvitation: async (
    slackUserId: string,
    slackTeamId: string,
    organizationId: number | null,
  ): Promise<SlackInvitation> => {
    const existing = await slackInvitationRepository.findBySlackUser(
      slackUserId,
      slackTeamId,
    );
    if (existing && !existing.usedAt && existing.expiresAt > new Date()) {
      return existing;
    }
    return slackInvitationRepository.create(
      slackUserId,
      slackTeamId,
      organizationId,
    );
  },

  completeSlackInvitation: async (
    token: string,
    userId: string,
  ): Promise<SlackUserMapping> => {
    const invitation = await slackInvitationRepository.findByToken(token);
    if (!invitation) {
      throw new Error("Invitation not found");
    }
    if (invitation.usedAt) {
      throw new Error("Invitation already used");
    }
    if (invitation.expiresAt < new Date()) {
      throw new Error("Invitation expired");
    }

    await slackInvitationRepository.markUsed(invitation.id);
    return slackMappingRepository.create(
      userId,
      invitation.slackUserId,
      invitation.slackTeamId,
    );
  },
};
