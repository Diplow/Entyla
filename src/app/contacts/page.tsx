import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { IamService } from "~/lib/domains";
import { ContactsPageContent } from "~/app/contacts/_components/ContactsPageContent";

export default async function ContactsPage() {
  const currentUser = await IamService.getCurrentUser(await headers());

  if (!currentUser) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center gap-8 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">Contacts</h1>
        <ContactsPageContent />
      </div>
    </main>
  );
}
