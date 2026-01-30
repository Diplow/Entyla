import { IamService } from "~/lib/domains/iam";
import { ConversationService } from "~/lib/domains/messaging";
import { withApiLogging } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

const handlers = withApiLogging(
  "/api/conversations/[id]",
  {
    GET: async (
      _request: Request,
      { params }: { params: Promise<{ id: string }> },
    ) => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { id } = await params;
      const conversationId = Number(id);
      if (Number.isNaN(conversationId)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
      }

      const foundConversation = await ConversationService.getById(
        conversationId,
        currentUser.id,
      );
      if (!foundConversation) {
        return Response.json({ error: "Not found" }, { status: 404 });
      }

      return Response.json(foundConversation);
    },
  },
  resolveSessionUserId,
);

export const { GET } = handlers;
