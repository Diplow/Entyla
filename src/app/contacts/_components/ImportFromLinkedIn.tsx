"use client";

import type React from "react";
import { useState } from "react";
import posthog from "posthog-js";

import { LinkedInUrlForm } from "~/app/contacts/_components/LinkedInUrlForm";
import { LinkedInPreviewForm } from "~/app/contacts/_components/LinkedInPreviewForm";

interface LinkedInProfileData {
  providerId: string;
  firstName: string;
  lastName: string;
  headline: string | null;
  linkedinUrl: string;
  currentJobTitle: string | null;
}

interface LinkedInCompanyData {
  providerId: string | null;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  linkedinUrl: string | null;
}

interface ExistingContact {
  id: number;
  firstName: string;
  lastName: string;
}

interface PreviewData {
  profile: LinkedInProfileData;
  company: LinkedInCompanyData | null;
  existingContact: ExistingContact | null;
}

interface ImportFromLinkedInProps {
  onContactCreated: () => void;
  onCancel?: () => void;
}

type ImportState = "idle" | "loading" | "preview" | "submitting";

export function ImportFromLinkedIn({
  onContactCreated,
  onCancel,
}: ImportFromLinkedInProps) {
  const [state, setState] = useState<ImportState>("idle");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    phone: "",
    notes: "",
  });
  const [createCompany, setCreateCompany] = useState(true);

  async function handleFetchProfile(event: React.FormEvent) {
    event.preventDefault();
    setState("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contacts/linkedin-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedinUrl }),
      });

      const data = (await response.json()) as
        | PreviewData
        | { error: string; code?: string };

      if (!response.ok) {
        const errorData = data as { error: string };
        throw new Error(errorData.error);
      }

      const preview = data as PreviewData;
      setPreviewData(preview);
      setFormData({
        firstName: preview.profile.firstName,
        lastName: preview.profile.lastName,
        email: "",
        jobTitle: preview.profile.currentJobTitle ?? "",
        phone: "",
        notes: preview.profile.headline ?? "",
      });
      setState("preview");

      posthog.capture("linkedin_profile_fetched", {
        has_company: Boolean(preview.company),
        is_duplicate: Boolean(preview.existingContact),
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch profile";
      setErrorMessage(message);
      setState("idle");
      posthog.captureException(error);
    }
  }

  async function handleCreateContact(event: React.FormEvent) {
    event.preventDefault();
    if (!previewData) return;

    setState("submitting");
    setErrorMessage(null);

    try {
      let companyId: number | undefined;

      if (createCompany && previewData.company) {
        const companyResponse = await fetch("/api/contacts/companies", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: previewData.company.name,
            linkedinProviderId: previewData.company.providerId ?? undefined,
            linkedinUrl: previewData.company.linkedinUrl ?? undefined,
            industry: previewData.company.industry ?? undefined,
            size: previewData.company.size ?? undefined,
            website: previewData.company.website ?? undefined,
          }),
        });

        if (!companyResponse.ok) {
          throw new Error("Failed to create company");
        }

        const companyData = (await companyResponse.json()) as { id: number };
        companyId = companyData.id;
      }

      const contactResponse = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || undefined,
          company: previewData.company?.name ?? undefined,
          jobTitle: formData.jobTitle || undefined,
          phone: formData.phone || undefined,
          notes: formData.notes || undefined,
          linkedinProviderId: previewData.profile.providerId,
          linkedinUrl: previewData.profile.linkedinUrl,
          companyId,
        }),
      });

      if (!contactResponse.ok) {
        throw new Error("Failed to create contact");
      }

      posthog.capture("contact_created_from_linkedin", {
        has_company: Boolean(companyId),
        has_email: Boolean(formData.email),
      });

      resetFormState();
      onContactCreated();
    } catch (error) {
      posthog.captureException(error);
      setErrorMessage("Failed to create contact. Please try again.");
      setState("preview");
    }
  }

  function resetFormState() {
    setState("idle");
    setLinkedinUrl("");
    setPreviewData(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      phone: "",
      notes: "",
    });
    setCreateCompany(true);
    setErrorMessage(null);
  }

  function handleCancel() {
    if (state === "loading" || state === "submitting") {
      return;
    }
    resetFormState();
    onCancel?.();
  }

  if (state === "idle" || state === "loading") {
    return (
      <LinkedInUrlForm
        linkedinUrl={linkedinUrl}
        onLinkedinUrlChange={setLinkedinUrl}
        onSubmit={handleFetchProfile}
        onCancel={handleCancel}
        isLoading={state === "loading"}
        errorMessage={errorMessage}
      />
    );
  }

  return (
    <LinkedInPreviewForm
      formData={formData}
      onFormDataChange={setFormData}
      existingContact={previewData?.existingContact ?? null}
      company={previewData?.company ?? null}
      createCompany={createCompany}
      onCreateCompanyChange={setCreateCompany}
      onSubmit={handleCreateContact}
      onCancel={handleCancel}
      isSubmitting={state === "submitting"}
      errorMessage={errorMessage}
    />
  );
}
