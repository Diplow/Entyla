import type { InitiativeRepository } from "../repositories";
import type { Initiative } from "../objects";

const DEFAULT_INITIATIVE_NAME = "AI Experimentation";
const DEFAULT_INITIATIVE_DESCRIPTION =
  "Open exploration bucket for AI tools, workflows, and ideas";

export async function createDefaultInitiative(
  repository: InitiativeRepository,
  organizationId: number,
): Promise<Initiative> {
  const existing = await repository.findDefaultByOrganization(organizationId);
  if (existing) {
    return existing;
  }

  return repository.create({
    organizationId,
    name: DEFAULT_INITIATIVE_NAME,
    description: DEFAULT_INITIATIVE_DESCRIPTION,
    status: "exploration",
    isDefaultBucket: true,
  });
}

export async function proposeInitiative(
  repository: InitiativeRepository,
  organizationId: number,
  userId: string,
  name: string,
  description: string | null,
): Promise<Initiative> {
  return repository.create({
    organizationId,
    name,
    description,
    status: "proposed",
    proposedById: userId,
  });
}

export async function approveInitiative(
  repository: InitiativeRepository,
  initiativeId: number,
  organizationId: number,
  adminUserId: string,
): Promise<Initiative | null> {
  const initiative = await repository.findByIdAndOrganization(
    initiativeId,
    organizationId,
  );

  if (!initiative || initiative.status !== "proposed") {
    return null;
  }

  return repository.update(initiativeId, {
    status: "approved",
    approvedById: adminUserId,
  });
}

export async function rejectInitiative(
  repository: InitiativeRepository,
  initiativeId: number,
  organizationId: number,
): Promise<Initiative | null> {
  const initiative = await repository.findByIdAndOrganization(
    initiativeId,
    organizationId,
  );

  if (!initiative || initiative.status !== "proposed") {
    return null;
  }

  return repository.update(initiativeId, {
    status: "stopped",
  });
}

export async function pauseInitiative(
  repository: InitiativeRepository,
  initiativeId: number,
  organizationId: number,
): Promise<Initiative | null> {
  const initiative = await repository.findByIdAndOrganization(
    initiativeId,
    organizationId,
  );

  if (!initiative) {
    return null;
  }

  if (initiative.isDefaultBucket) {
    return null;
  }

  return repository.update(initiativeId, {
    status: "paused",
  });
}

export async function listInitiatives(
  repository: InitiativeRepository,
  organizationId: number,
): Promise<Initiative[]> {
  return repository.findAllByOrganization(organizationId);
}

export async function listPendingProposals(
  repository: InitiativeRepository,
  organizationId: number,
): Promise<Initiative[]> {
  return repository.findPendingByOrganization(organizationId);
}
