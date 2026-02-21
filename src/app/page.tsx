import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 overflow-auto flex-col items-center justify-center text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight">Entyla</h1>
        <p className="max-w-lg text-center text-lg text-white/70">
          Track your AI experimentation portfolio with weekly coaching and budget visibility.
          Surface promising experiments and turn them into formal initiatives.
        </p>
        <div className="flex gap-4">
          <Link
            href="/contacts"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
          >
            View Contacts
          </Link>
          <Link
            href="/settings"
            className="rounded-full bg-purple-600 px-10 py-3 font-semibold no-underline transition hover:bg-purple-500"
          >
            Settings
          </Link>
        </div>
      </div>
    </main>
  );
}
