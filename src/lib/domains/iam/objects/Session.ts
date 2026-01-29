import type { User } from "./User";

export interface Session {
  user: User;
  expiresAt: Date;
}
