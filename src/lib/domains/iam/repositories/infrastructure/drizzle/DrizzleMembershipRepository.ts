import { eq } from "drizzle-orm";

import { db, membership, organization } from "~/server/db";
import type { MembershipRepository } from "../../MembershipRepository";
import type { Membership, Organization } from "../../../objects";

export class DrizzleMembershipRepository implements MembershipRepository {
  async findByUser(userId: string): Promise<Membership | null> {
    const foundMembership = await db.query.membership.findFirst({
      where: eq(membership.userId, userId),
    });

    if (!foundMembership) return null;

    return {
      ...foundMembership,
      role: foundMembership.role as Membership["role"],
    };
  }

  async findOrganizationByUser(userId: string): Promise<Organization | null> {
    const foundMembership = await db.query.membership.findFirst({
      where: eq(membership.userId, userId),
      with: { organization: true },
    });

    return foundMembership?.organization ?? null;
  }
}
