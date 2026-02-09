import type React from "react";

const INPUT_CLASS_NAME =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30";

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  phone: string;
  notes: string;
}

interface ExistingContact {
  id: number;
  firstName: string;
  lastName: string;
}

interface CompanyData {
  name: string;
  industry: string | null;
  size: string | null;
}

interface LinkedInPreviewFormProps {
  formData: ContactFormData;
  onFormDataChange: (updater: (previous: ContactFormData) => ContactFormData) => void;
  existingContact: ExistingContact | null;
  company: CompanyData | null;
  createCompany: boolean;
  onCreateCompanyChange: (value: boolean) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  errorMessage: string | null;
}

export function LinkedInPreviewForm({
  formData,
  onFormDataChange,
  existingContact,
  company,
  createCompany,
  onCreateCompanyChange,
  onSubmit,
  onCancel,
  isSubmitting,
  errorMessage,
}: LinkedInPreviewFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-xl bg-white/10 p-6"
    >
      <h2 className="mb-4 text-xl font-bold">Review & Create Contact</h2>

      {errorMessage && (
        <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
      )}

      {existingContact && (
        <div className="mb-4 rounded-lg bg-yellow-500/20 p-3 text-sm text-yellow-200">
          A contact with this LinkedIn profile already exists:{" "}
          <strong>
            {existingContact.firstName} {existingContact.lastName}
          </strong>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="First name *"
          value={formData.firstName}
          onChange={(event) =>
            onFormDataChange((previous) => ({
              ...previous,
              firstName: event.target.value,
            }))
          }
          required
          className={INPUT_CLASS_NAME}
        />
        <input
          type="text"
          placeholder="Last name *"
          value={formData.lastName}
          onChange={(event) =>
            onFormDataChange((previous) => ({
              ...previous,
              lastName: event.target.value,
            }))
          }
          required
          className={INPUT_CLASS_NAME}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(event) =>
            onFormDataChange((previous) => ({
              ...previous,
              email: event.target.value,
            }))
          }
          className={INPUT_CLASS_NAME}
        />
        <input
          type="text"
          placeholder="Job title"
          value={formData.jobTitle}
          onChange={(event) =>
            onFormDataChange((previous) => ({
              ...previous,
              jobTitle: event.target.value,
            }))
          }
          className={INPUT_CLASS_NAME}
        />
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(event) =>
            onFormDataChange((previous) => ({
              ...previous,
              phone: event.target.value,
            }))
          }
          className={INPUT_CLASS_NAME}
        />
        <textarea
          placeholder="Notes"
          value={formData.notes}
          onChange={(event) =>
            onFormDataChange((previous) => ({
              ...previous,
              notes: event.target.value,
            }))
          }
          rows={3}
          className={INPUT_CLASS_NAME}
        />

        {company && (
          <div className="mt-2 rounded-lg bg-white/5 p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={createCompany}
                onChange={(event) => onCreateCompanyChange(event.target.checked)}
                className="rounded"
              />
              Also create company: <strong>{company.name}</strong>
            </label>
            {company.industry && (
              <p className="mt-1 text-xs text-white/60">
                Industry: {company.industry}
              </p>
            )}
            {company.size && (
              <p className="text-xs text-white/60">
                Size: {company.size}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || Boolean(existingContact)}
          className="rounded-full bg-white/20 px-6 py-2 font-semibold transition hover:bg-white/30 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Contact"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
