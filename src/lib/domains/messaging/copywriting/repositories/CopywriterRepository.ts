import type { DraftRequest, DraftResult } from "../objects";

export interface CopywriterRepository {
  generateDraft(request: DraftRequest): Promise<DraftResult>;
}
