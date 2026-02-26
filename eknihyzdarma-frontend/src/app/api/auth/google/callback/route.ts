import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const accessToken = searchParams.get("access_token");

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access_token" }, { status: 400 });
  }

  const res = await fetch(
    `${STRAPI_URL}/api/auth/google/callback?access_token=${encodeURIComponent(accessToken)}`
  );
  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "Authentication failed" },
      { status: res.status }
    );
  }

  return NextResponse.json(data);
}
