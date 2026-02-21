"use client";

import Link from "next/link";

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
}

interface CompanyContactListProps {
  contacts: Contact[];
}

export function CompanyContactList({ contacts }: CompanyContactListProps) {
  if (contacts.length === 0) {
    return (
      <div>
        <h2 className="mb-2 text-lg font-semibold">Contacts</h2>
        <p className="text-white/50">No contacts for this company.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">Contacts</h2>
      <div className="flex flex-col gap-2">
        {contacts.map((contact) => (
          <Link
            key={contact.id}
            href={`/contacts/${contact.id}`}
            className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3 transition hover:bg-white/20"
          >
            <div>
              <p className="font-medium">
                {contact.firstName} {contact.lastName}
              </p>
              {contact.jobTitle && (
                <p className="text-sm text-white/70">{contact.jobTitle}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
