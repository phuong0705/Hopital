import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET() {
  const cookieStore = await cookies();
  const response = await fetch(`${API_URL}/api/reports/summary`, {
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
