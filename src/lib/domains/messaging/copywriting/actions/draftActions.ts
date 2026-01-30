import type { CopywriterRepository } from "../repositories";
import type { DraftRequest } from "../objects";

export async function draftMessage(
  repository: CopywriterRepository,
  request: DraftRequest,
) {
  return repository.generateDraft(request);
}
