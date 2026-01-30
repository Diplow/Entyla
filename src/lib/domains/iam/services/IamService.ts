import { BetterAuthUserRepository } from "../repositories";
import type { User } from "../objects";

const userRepository = new BetterAuthUserRepository();

export const IamService = {
  getCurrentUser: (): Promise<User | null> => userRepository.getCurrentUser(),
};
