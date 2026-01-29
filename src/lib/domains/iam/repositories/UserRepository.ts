import type { User } from "../objects";

export interface UserRepository {
  getCurrentUser(headers: Headers): Promise<User | null>;
}
