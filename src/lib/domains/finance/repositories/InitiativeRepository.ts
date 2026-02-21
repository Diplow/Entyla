import type {
  Initiative,
  InitiativeCreateInput,
  InitiativeUpdateInput,
} from "../objects";

export interface InitiativeRepository {
  create(input: InitiativeCreateInput): Promise<Initiative>;
  findById(initiativeId: number): Promise<Initiative | null>;
  findByIdAndOrganization(
    initiativeId: number,
    organizationId: number,
  ): Promise<Initiative | null>;
  findAllByOrganization(organizationId: number): Promise<Initiative[]>;
  findPendingByOrganization(organizationId: number): Promise<Initiative[]>;
  findDefaultByOrganization(organizationId: number): Promise<Initiative | null>;
  update(
    initiativeId: number,
    input: InitiativeUpdateInput,
  ): Promise<Initiative | null>;
}
