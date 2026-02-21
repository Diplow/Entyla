export type OrganizationId = number;

export interface Organization {
  id: OrganizationId;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
}
