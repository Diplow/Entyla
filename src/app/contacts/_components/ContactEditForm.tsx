"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import posthog from "posthog-js";

import { ContactFormFields } from "~/app/contacts/_components/ContactFormFields";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  phone: string | null;
  notes: string | null;
}

interface ContactEditFormProps {
  contact: Contact;
  onSaved: () => void;
  onCancel: () => void;
}

export function ContactEditForm({
  contact,
  onSaved,
  onCancel,
}: ContactEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email ?? "",
    company: contact.company ?? "",
    jobTitle: contact.jobTitle ?? "",
    phone: contact.phone ?? "",
    notes: contact.notes ?? "",
  });

  function handleFieldChange(field: keyof typeof formData, value: string) {
    setFormData((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/contacts/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          company: formData.company || undefined,
          jobTitle: formData.jobTitle || undefined,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact");
      }

      posthog.capture("contact_edited", { contact_id: contact.id });
      onSaved();
    } catch (error) {
      posthog.captureException(error);
      setErrorMessage("Failed to update contact. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {errorMessage && (
        <p className="text-sm text-red-400">{errorMessage}</p>
      )}
      <ContactFormFields formData={formData} onChange={handleFieldChange} />
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-white/20 px-6 py-2 font-semibold transition hover:bg-white/30 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
