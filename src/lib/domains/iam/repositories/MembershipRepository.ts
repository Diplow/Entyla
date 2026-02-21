import type { Membership, Organization } from "../objects";

export interface MembershipRepository {
  findByUser(userId: string): Promise<Membership | null>;
  findOrganizationByUser(userId: string): Promise<Organization | null>;
}
