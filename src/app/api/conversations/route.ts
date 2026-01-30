import { z } from "zod";

import { IamService } from "~/lib/domains/iam";
import { ContactService } from "~/lib/domains/prospect";
import { ConversationService, DraftService } from "~/lib/domains/messaging";
import type { ContactInfo } from "~/lib/domains/messaging";
import { withApiLogging, getPostHogClient } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

const createConversationSchema = z.object({
  contactId: z.number().int().positive(),
  sellingContext: z.string().min(1),
});

const handlers = withApiLogging(
  "/api/conversations",
  {
    GET: async () => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const conversations = await ConversationService.list(currentUser.id);
      return Response.json(conversations);
    },

    POST: async (request: Request) => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body: unknown = await request.json();
      const parseResult = createConversationSchema.safeParse(body);
      if (!parseResult.success) {
        return Response.json(
          { error: parseResult.error.flatten() },
          { status: 400 },
        );
      }

      const { contactId, sellingContext } = parseResult.data;

      const contact = await ContactService.getById(contactId, currentUser.id);
      if (!contact) {
        return Response.json({ error: "Contact not found" }, { status: 404 });
      }

      const createdConversation = await ConversationService.create(
        currentUser.id,
        {
          contactId,
          sellingContext,
        },
      );

      const contactInfo: ContactInfo = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        company: contact.company,
        jobTitle: contact.jobTitle,
      };

      const draftResult = await DraftService.generateAndPersist(
        createdConversation.id,
        {
          contactInfo,
          sellingContext,
          conversationHistory: [],
        },
      );

      const posthog = getPostHogClient();
      posthog?.capture({
        distinctId: currentUser.id,
        event: "conversation_created_server",
        properties: {
          conversation_id: createdConversation.id,
          contact_id: contactId,
          selling_context_length: sellingContext.length,
        },
      });

      return Response.json(
        { conversation: createdConversation, firstMessage: draftResult },
        { status: 201 },
      );
    },
  },
  resolveSessionUserId,
);

export const { GET, POST } = handlers;
