"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { BudgetOverview } from "./_components/BudgetOverview";
import { InitiativeBurnChart } from "./_components/InitiativeBurnChart";
import { WeeklyTrendChart } from "./_components/WeeklyTrendChart";
import { SignalsPanel } from "./_components/SignalsPanel";
import { InitiativeList } from "./_components/InitiativeList";

interface BudgetSummary {
  totalPersonDays: number;
  consumedPersonDays: number;
  remainingPersonDays: number;
  burnRate: number;
  forecastExhaustionDate: string | null;
}

interface InitiativeBurn {
  initiativeId: number;
  initiativeName: string;
  personDaysConsumed: number;
  isDefaultBucket: boolean;
}

interface WeeklyTrendPoint {
  weekOf: string;
  explorationPersonDays: number;
  structuredPersonDays: number;
  totalPersonDays: number;
}

interface Signal {
  type: "pending_proposal" | "budget_warning" | "stale_initiative";
  initiativeId?: number;
  message: string;
}

interface Initiative {
  id: number;
  name: string;
  description: string | null;
  status: string;
  isDefaultBucket: boolean;
}

interface ReportingData {
  budgetSummary: BudgetSummary | null;
  burnByInitiative: InitiativeBurn[];
  weeklyTrend: WeeklyTrendPoint[];
  signals: Signal[];
  initiatives: Initiative[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reportingData, setReportingData] = useState<ReportingData | null>(null);

  const fetchReportingData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/reporting");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          return;
        }
        throw new Error("Failed to fetch reporting data");
      }

      const data = (await response.json()) as ReportingData;
      setReportingData(data);
    } catch (error) {
      console.error("Error fetching reporting data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchReportingData();
  }, [fetchReportingData]);

  if (isLoading) {
    return (
      <main className="flex flex-1 overflow-auto flex-col items-center text-white">
        <div className="container flex flex-col items-center gap-8 px-4 py-16">
          <p className="text-white/50">Loading dashboard...</p>
        </div>
      </main>
    );
  }

  if (!reportingData) {
    return (
      <main className="flex flex-1 overflow-auto flex-col items-center text-white">
        <div className="container flex flex-col items-center gap-8 px-4 py-16">
          <p className="text-white/50">No data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 overflow-auto flex-col items-center text-white">
      <div className="container flex flex-col gap-8 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Experimentation Dashboard</h1>
            <p className="mt-1 text-white/60">
              Track your organization&apos;s AI exploration budget
            </p>
          </div>
          <button
            onClick={() => void fetchReportingData()}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500"
          >
            Refresh
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <BudgetOverview budgetSummary={reportingData.budgetSummary} />
          <SignalsPanel signals={reportingData.signals} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <InitiativeBurnChart burnByInitiative={reportingData.burnByInitiative} />
          <WeeklyTrendChart weeklyTrend={reportingData.weeklyTrend} />
        </div>

        <InitiativeList initiatives={reportingData.initiatives} />
      </div>
    </main>
  );
}
