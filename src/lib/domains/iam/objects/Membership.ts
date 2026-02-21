import type { UserId } from "./User";
import type { OrganizationId } from "./Organization";

export type MemberRole = "admin" | "member";

export interface Membership {
  id: number;
  userId: UserId;
  organizationId: OrganizationId;
  role: MemberRole;
  createdAt: Date;
  updatedAt: Date | null;
}
