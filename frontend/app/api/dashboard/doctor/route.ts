import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { API_URL } from "@/lib/api";

export async function GET() {
  const cookieStore = await cookies();
  const response = await fetch(`${API_URL}/api/dashboard/doctor`, {
    headers: {
      Cookie: cookieStore.toString()
    },
    cache: "no-store"
  });

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      {
        message: "Backend session is missing or expired."
      },
      { status: response.ok ? 401 : response.status }
    );
  }

  const body = await response.text();

  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": contentType || "application/json"
    }
  });
}
