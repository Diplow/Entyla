import { z } from "zod";

import { ContactService, IamService } from "~/lib/domains";
import { headers } from "next/headers";

const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await IamService.getCurrentUser(await headers());
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contactId = Number(id);
  if (Number.isNaN(contactId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const contact = await ContactService.getById(contactId, currentUser.id);
  if (!contact) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(contact);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await IamService.getCurrentUser(await headers());
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json();
  const parseResult = updateContactSchema.safeParse(body);
  if (!parseResult.success) {
    return Response.json({ error: parseResult.error.flatten() }, { status: 400 });
  }

  const { id } = await params;
  const contactId = Number(id);
  if (Number.isNaN(contactId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const updatedContact = await ContactService.update(contactId, currentUser.id, parseResult.data);
  if (!updatedContact) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(updatedContact);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const currentUser = await IamService.getCurrentUser(await headers());
  if (!currentUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const contactId = Number(id);
  if (Number.isNaN(contactId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const wasDeleted = await ContactService.delete(contactId, currentUser.id);
  if (!wasDeleted) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}
