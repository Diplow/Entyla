import {
  BetterAuthUserRepository,
  DrizzleMembershipRepository,
  DrizzleSlackUserMappingRepository,
} from "../repositories";
import type {
  User,
  Organization,
  Membership,
  MemberRole,
  SlackUserMapping,
} from "../objects";

const userRepository = new BetterAuthUserRepository();
const membershipRepository = new DrizzleMembershipRepository();
const slackMappingRepository = new DrizzleSlackUserMappingRepository();

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
};
