"use client";

import Link from "next/link";
import { useState } from "react";
import posthog from "posthog-js";

import { ContactEditForm } from "~/app/contacts/_components/ContactEditForm";
import { LinkedInLink } from "~/app/contacts/_components/LinkedInLink";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  companyId: number | null;
  jobTitle: string | null;
  phone: string | null;
  notes: string | null;
  linkedinUrl: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ContactCardProps {
  contact: Contact;
  onDeleted: () => void;
  onUpdated: () => void;
}

export function ContactCard({ contact, onDeleted, onUpdated }: ContactCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  async function handleDelete() {
    posthog.capture("contact_delete_clicked", {
      contact_id: contact.id,
    });
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete contact");
      }
      onDeleted();
    } catch (error) {
      posthog.captureException(error);
      setIsDeleting(false);
      alert("Failed to delete contact. Please try again.");
    }
  }

  function handleSaved() {
    setIsEditing(false);
    onUpdated();
  }

  const fullName = `${contact.firstName} ${contact.lastName}`;

  if (isEditing) {
    return (
      <div className="rounded-xl bg-white/10 p-4">
        <ContactEditForm
          contact={contact}
          onSaved={handleSaved}
          onCancel={() => setIsEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white/10 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{fullName}</h3>
          {contact.jobTitle && <p className="text-sm text-white/70">{contact.jobTitle}</p>}
          {contact.company && (
            <p className="text-sm text-white/70">
              {contact.companyId ? (
                <Link href={`/companies/${contact.companyId}`} className="hover:text-white hover:underline">
                  {contact.company}
                </Link>
              ) : (
                contact.company
              )}
            </p>
          )}
          {contact.email && <p className="text-sm text-white/70">{contact.email}</p>}
          {contact.phone && <p className="text-sm text-white/70">{contact.phone}</p>}
          {contact.notes && <p className="mt-2 text-sm text-white/50 italic">{contact.notes}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <LinkedInLink linkedinUrl={contact.linkedinUrl} />
          <Link
            href={`/messaging?contactId=${contact.id}`}
            className="rounded-lg bg-purple-500/20 px-3 py-1 text-sm text-purple-300 transition hover:bg-purple-500/30"
          >
            Message
          </Link>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-lg bg-white/10 px-3 py-1 text-sm text-white/70 transition hover:bg-white/20"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
