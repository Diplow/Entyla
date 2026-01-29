import { auth } from "~/server/better-auth";
import type { UserRepository } from "../../UserRepository";
import type { User } from "../../../objects";

export class BetterAuthUserRepository implements UserRepository {
  async getCurrentUser(headers: Headers): Promise<User | null> {
    const session = await auth.api.getSession({ headers });
    if (!session) return null;

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
  }
}
