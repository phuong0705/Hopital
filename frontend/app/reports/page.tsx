import { cookies } from "next/headers";
import dynamic from "next/dynamic";
import { ReportsLoading } from "@/components/reports/reports-loading";
import type { ReportsPayload } from "@/components/reports/types";
import { API_URL } from "@/lib/api";

const ReportsShell = dynamic(
  () => import("@/components/reports/reports-shell").then((mod) => mod.ReportsShell),
  {
    loading: () => <ReportsLoading />
  }
);

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
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const [payload, params] = await Promise.all([getReports(), searchParams]);

  return (
    <ReportsShell
      initialPayload={payload}
      initialTab={params.tab}
      initialQuery={params.q || ""}
      apiBaseUrl={API_URL}
    />
  );
}
