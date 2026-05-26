import { cookies } from "next/headers";
import { ReportsShell } from "@/components/reports/reports-shell";
import type { ReportsPayload } from "@/components/reports/types";
import { API_URL } from "@/lib/api";

async function getReports(): Promise<ReportsPayload | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${API_URL}/api/reports/summary`, {
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

  return <ReportsShell initialPayload={payload} initialTab={params.tab} apiBaseUrl={API_URL} />;
}
