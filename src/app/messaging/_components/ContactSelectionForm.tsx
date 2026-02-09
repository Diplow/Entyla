import Link from "next/link";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  company: string | null;
}

interface MatchingConversation {
  id: number;
}

interface ContactSelectionFormProps {
  contacts: Contact[];
  selectedContactId: number | "";
  onSelectedContactIdChange: (value: number | "") => void;
  matchingConversation: MatchingConversation | null;
  onConversationCreated: (conversationId: number) => void;
  onBack: () => void;
  onSubmit: (event: React.FormEvent) => void;
  isLoading: boolean;
}

export function ContactSelectionForm({
  contacts,
  selectedContactId,
  onSelectedContactIdChange,
  matchingConversation,
  onConversationCreated,
  onBack,
  onSubmit,
  isLoading,
}: ContactSelectionFormProps) {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-sm text-white/50 transition hover:text-white"
        >
          &larr; Back to conversations
        </button>
        <Link
          href="/settings"
          className="text-sm text-white/50 transition hover:text-white"
        >
          Customize AI in Settings
        </Link>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="contact-select" className="text-sm font-medium">
            Contact
          </label>
          <select
            id="contact-select"
            value={selectedContactId}
            onChange={(event) =>
              onSelectedContactIdChange(Number(event.target.value) || "")
            }
            className="rounded-lg bg-white/10 px-4 py-2 text-white"
            required
          >
            <option value="">Select a contact...</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName}
                {contact.company ? ` (${contact.company})` : ""}
              </option>
            ))}
          </select>
        </div>

        {matchingConversation && (
          <div className="rounded-lg bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
            <p>A conversation already exists with this contact.</p>
            <button
              type="button"
              onClick={() => onConversationCreated(matchingConversation.id)}
              className="mt-2 font-medium text-yellow-100 underline transition hover:text-white"
            >
              Open existing conversation
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !selectedContactId}
          className="rounded-lg bg-purple-600 px-4 py-2 font-medium transition hover:bg-purple-500 disabled:opacity-50"
        >
          {isLoading ? "Generating First Message..." : "Generate First Message"}
        </button>
      </form>
    </div>
  );
}
