import type React from "react";

const INPUT_CLASS_NAME =
  "w-full rounded-lg bg-white/10 px-3 py-2 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-white/30";

interface LinkedInUrlFormProps {
  linkedinUrl: string;
  onLinkedinUrlChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}

export function LinkedInUrlForm({
  linkedinUrl,
  onLinkedinUrlChange,
  onSubmit,
  onCancel,
  isLoading,
  errorMessage,
}: LinkedInUrlFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-md rounded-xl bg-white/10 p-6"
    >
      <h2 className="mb-4 text-xl font-bold">Import from LinkedIn</h2>
      {errorMessage && (
        <p className="mb-4 text-sm text-red-400">{errorMessage}</p>
      )}
      <div className="flex flex-col gap-3">
        <input
          type="url"
          placeholder="LinkedIn profile URL"
          value={linkedinUrl}
          onChange={(event) => onLinkedinUrlChange(event.target.value)}
          required
          className={INPUT_CLASS_NAME}
        />
        <p className="text-xs text-white/60">
          Example: https://www.linkedin.com/in/username
        </p>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-full bg-white/20 px-6 py-2 font-semibold transition hover:bg-white/30 disabled:opacity-50"
        >
          {isLoading ? "Fetching..." : "Fetch Profile"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
