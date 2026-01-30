import { z } from "zod";

import { ContactService } from "~/lib/domains/prospect";
import { IamService } from "~/lib/domains/iam";
import { withApiLogging, getPostHogClient } from "~/lib/logging";
import { resolveSessionUserId } from "~/server/better-auth";

const createContactSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

const handlers = withApiLogging(
  "/api/contacts",
  {
    GET: async () => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const contacts = await ContactService.list(currentUser.id);
      return Response.json(contacts);
    },

    POST: async (request: Request) => {
      const currentUser = await IamService.getCurrentUser();
      if (!currentUser) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body: unknown = await request.json();
      const parseResult = createContactSchema.safeParse(body);
      if (!parseResult.success) {
        return Response.json(
          { error: parseResult.error.flatten() },
          { status: 400 },
        );
      }

      const createdContact = await ContactService.create(
        currentUser.id,
        parseResult.data,
      );

      const posthog = getPostHogClient();
      posthog?.capture({
        distinctId: currentUser.id,
        event: "contact_created_server",
        properties: {
          contact_id: createdContact.id,
          has_email: Boolean(parseResult.data.email),
          has_company: Boolean(parseResult.data.company),
          has_job_title: Boolean(parseResult.data.jobTitle),
          has_phone: Boolean(parseResult.data.phone),
          has_notes: Boolean(parseResult.data.notes),
        },
      });

      return Response.json(createdContact, { status: 201 });
    },
  },
  resolveSessionUserId,
);

export const { GET, POST } = handlers;
