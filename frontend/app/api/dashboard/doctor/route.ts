import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const apiBaseUrl = process.env.REPORTS_API_BASE_URL || "http://localhost:3003";

export async function GET() {
  const cookieStore = await cookies();
  const response = await fetch(`${apiBaseUrl}/api/dashboard/doctor`, {
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
