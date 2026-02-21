import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { IamService } from "~/lib/domains/iam";
import { Header } from "~/app/_components/header";
import { LandingPage } from "~/app/_components/landing-page";
import { OnboardingGuard } from "~/app/_components/onboarding-guard";

export const metadata: Metadata = {
  title: "Entyla",
  description: "AI experimentation portfolio tracker",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const currentUser = await IamService.getCurrentUser();

  if (!currentUser) {
    return (
      <html lang="en" className={`${geist.variable}`}>
        <body className="bg-gradient-to-b from-[#2e026d] to-[#15162c]">
          <LandingPage />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="flex flex-col h-screen overflow-hidden bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <OnboardingGuard>
          <Header
            userName={currentUser.name}
            userImage={currentUser.image ?? null}
          />
          {children}
        </OnboardingGuard>
      </body>
    </html>
  );
}
