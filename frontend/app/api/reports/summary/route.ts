import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiBaseUrl = process.env.REPORTS_API_BASE_URL || "http://localhost:3003";

export async function GET() {
  const cookieStore = await cookies();
  const response = await fetch(`${apiBaseUrl}/api/reports/summary`, {
    headers: {
      Cookie: cookieStore.toString()
    },
    cache: "no-store"
  });

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") || "application/json"
    }
  });
}
