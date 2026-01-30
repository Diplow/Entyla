import { headers } from "next/headers";

import { IamService } from "~/lib/domains/iam";
import { ConversationService } from "~/lib/domains/messaging";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await IamService.getCurrentUser(await headers());
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversationId = Number(id);
  if (Number.isNaN(conversationId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const foundConversation = await ConversationService.getById(conversationId, currentUser.id);
  if (!foundConversation) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(foundConversation);
}
