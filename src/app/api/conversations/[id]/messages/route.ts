import { z } from "zod";
import { headers } from "next/headers";

import { IamService } from "~/lib/domains/iam";
import { ContactService } from "~/lib/domains/prospect";
import { ConversationService, DraftService } from "~/lib/domains/messaging";
import type { ContactInfo, ConversationMessage } from "~/lib/domains/messaging";
import { withApiLogging } from "~/lib/logging";

const createMessageSchema = z.object({
  role: z.enum(["prospect", "contact"]),
  content: z.string().optional(),
});

const handlers = withApiLogging("/api/conversations/[id]/messages", {
  GET: async (
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
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

    const messages = await ConversationService.getMessages(conversationId);
    return Response.json(messages);
  },

  POST: async (
    request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) => {
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

    const body: unknown = await request.json();
    const parseResult = createMessageSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: parseResult.error.flatten() }, { status: 400 });
    }

    const { role, content } = parseResult.data;

    if (role === "contact") {
      if (!content) {
        return Response.json({ error: "Content is required for contact messages" }, { status: 400 });
      }
      const savedMessage = await ConversationService.addContactResponse({
        conversationId,
        role: "contact",
        content,
      });
      return Response.json(savedMessage, { status: 201 });
    }

    const contact = await ContactService.getById(foundConversation.contactId, currentUser.id);
    if (!contact) {
      return Response.json({ error: "Contact not found" }, { status: 404 });
    }

    const contactInfo: ContactInfo = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      jobTitle: contact.jobTitle,
    };

    const existingMessages = await ConversationService.getMessages(conversationId);
    const conversationHistory: ConversationMessage[] = existingMessages.map((message) => ({
      role: message.role as "prospect" | "contact",
      content: message.content,
    }));

    const draftResult = await DraftService.generateAndPersist(conversationId, {
      contactInfo,
      sellingContext: foundConversation.sellingContext,
      conversationHistory,
    });

    return Response.json(draftResult, { status: 201 });
  },
});

export const { GET, POST } = handlers;
