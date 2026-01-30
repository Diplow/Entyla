import { z } from "zod";

import { ContactService } from "~/lib/domains/prospect";
import { IamService } from "~/lib/domains/iam";
import { withApiLogging } from "~/lib/logging";
import { headers } from "next/headers";

const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

const handlers = withApiLogging("/api/contacts", {
  GET: async () => {
    const currentUser = await IamService.getCurrentUser(await headers());
    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contacts = await ContactService.list(currentUser.id);
    return Response.json(contacts);
  },

  POST: async (request: Request) => {
    const currentUser = await IamService.getCurrentUser(await headers());
    if (!currentUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parseResult = createContactSchema.safeParse(body);
    if (!parseResult.success) {
      return Response.json({ error: parseResult.error.flatten() }, { status: 400 });
    }

    const createdContact = await ContactService.create(currentUser.id, parseResult.data);
    return Response.json(createdContact, { status: 201 });
  },
});

export const { GET, POST } = handlers;
