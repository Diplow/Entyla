"use client";

import { useState } from "react";
import posthog from "posthog-js";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  notes: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string | null;
}

interface ContactCardProps {
  contact: Contact;
  onDeleted: () => void;
}

export function ContactCard({ contact, onDeleted }: ContactCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div className="rounded-xl bg-white/10 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold">{fullName}</h3>
          {contact.jobTitle && (
            <p className="text-sm text-white/70">{contact.jobTitle}</p>
          )}
          {contact.company && (
            <p className="text-sm text-white/70">{contact.company}</p>
          )}
          {contact.email && (
            <p className="text-sm text-white/70">{contact.email}</p>
          )}
          {contact.phone && (
            <p className="text-sm text-white/70">{contact.phone}</p>
          )}
          {contact.notes && (
            <p className="mt-2 text-sm text-white/50 italic">{contact.notes}</p>
          )}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="shrink-0 rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-300 transition hover:bg-red-500/30 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
