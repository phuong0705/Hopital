import { cookies } from "next/headers";
import { DoctorDashboardShell } from "@/components/doctor-dashboard/doctor-dashboard-shell";
import type { DoctorDashboardPayload } from "@/components/doctor-dashboard/types";

const apiBaseUrl = process.env.REPORTS_API_BASE_URL || "http://localhost:3003";

async function getDoctorDashboard(): Promise<DoctorDashboardPayload | null> {
  const cookieStore = await cookies();
  const response = await fetch(`${apiBaseUrl}/api/dashboard/doctor`, {
    headers: {
      Cookie: cookieStore.toString()
    },
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") || "";
  if (!response.ok || !contentType.includes("application/json")) return null;

  return response.json();
}

export default async function DoctorDashboardPage() {
  const payload = await getDoctorDashboard();

  return <DoctorDashboardShell initialPayload={payload} apiBaseUrl={apiBaseUrl} />;
}
