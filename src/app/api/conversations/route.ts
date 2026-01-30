import { z } from "zod";
import { headers } from "next/headers";

import { IamService } from "~/lib/domains/iam";
import { ContactService } from "~/lib/domains/prospect";
import { ConversationService, DraftService } from "~/lib/domains/messaging";
import type { ContactInfo } from "~/lib/domains/messaging";

const createConversationSchema = z.object({
  contactId: z.number().int().positive(),
  sellingContext: z.string().min(1),
});

export async function GET() {
  const currentUser = await IamService.getCurrentUser(await headers());
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await ConversationService.list(currentUser.id);
  return Response.json(conversations);
}

export async function POST(request: Request) {
  const currentUser = await IamService.getCurrentUser(await headers());
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parseResult = createConversationSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  const { contactId, sellingContext } = parseResult.data;

  const contact = await ContactService.getById(contactId, currentUser.id);
  if (!contact) {
    return Response.json({ error: "Contact not found" }, { status: 404 });
  }

  const createdConversation = await ConversationService.create(currentUser.id, {
    contactId,
    sellingContext,
  });

  const contactInfo: ContactInfo = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    company: contact.company,
    jobTitle: contact.jobTitle,
  };

  const draftResult = await DraftService.generateAndPersist(createdConversation.id, {
    contactInfo,
    sellingContext,
    conversationHistory: [],
  });

  return Response.json(
    { conversation: createdConversation, firstMessage: draftResult },
    { status: 201 },
  );
}
