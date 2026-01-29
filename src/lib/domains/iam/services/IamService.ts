import { BetterAuthUserRepository } from "../repositories";
import type { User } from "../objects";

const userRepository = new BetterAuthUserRepository();

export const IamService = {
  getCurrentUser: (headers: Headers): Promise<User | null> =>
    userRepository.getCurrentUser(headers),
};
