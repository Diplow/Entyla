"use client";

import Link from "next/link";

import { SignOutButton } from "~/app/_components/sign-out-button";

interface HeaderProps {
  userName: string;
  userImage: string | null;
}

function UserAvatar({ userName, userImage }: { userName: string; userImage: string | null }) {
  if (userImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={userImage}
        alt={userName}
        className="h-8 w-8 rounded-full"
      />
    );
  }

  const initials = userName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const displayInitials = initials || "?";

  return (
    <div
      className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-medium"
      role="img"
      aria-label={`Avatar for ${userName || "user"}`}
      title={userName}
    >
      {displayInitials}
    </div>
  );
}

export function Header({ userName, userImage }: HeaderProps) {
  return (
    <header className="flex w-full items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-bold text-white no-underline">
        Entyla
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="text-sm text-white/70 transition hover:text-white"
        >
          Dashboard
        </Link>
        <UserAvatar userName={userName} userImage={userImage} />
        <Link
          href="/settings"
          className="text-sm text-white/70 transition hover:text-white"
        >
          Settings
        </Link>
        <SignOutButton />
      </div>
    </header>
  );
}
