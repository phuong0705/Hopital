import { cookies } from "next/headers";
import { ReportsShell } from "@/components/reports/reports-shell";
import type { ReportsPayload } from "@/components/reports/types";

const apiBaseUrl = process.env.REPORTS_API_BASE_URL || "http://localhost:3001";

async function getReports(): Promise<ReportsPayload | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${apiBaseUrl}/api/reports/summary`, {
    headers: {
      Cookie: cookieStore.toString()
    },
    cache: "no-store"
  });

  if (!response.ok) return null;

  return response.json();
}

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [payload, params] = await Promise.all([getReports(), searchParams]);

  return <ReportsShell initialPayload={payload} initialTab={params.tab} apiBaseUrl={apiBaseUrl} />;
}
