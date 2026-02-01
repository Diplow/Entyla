import { BetterAuthUserRepository } from "../repositories";
import { BillingService } from "../subdomains";
import type { User } from "../objects";

const userRepository = new BetterAuthUserRepository();

export const IamService = {
  getCurrentUser: (): Promise<User | null> => userRepository.getCurrentUser(),

  checkCredits: (userId: string) =>
    BillingService.checkCredits(userId),

  recordUsage: (userId: string, inputTokens: number, outputTokens: number, model: string) =>
    BillingService.recordUsage(userId, inputTokens, outputTokens, model),
};
