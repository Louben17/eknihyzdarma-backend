import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const res = await fetch(`${STRAPI_URL}/api/users/me`, {
      headers: auth ? { Authorization: auth } : {},
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: { message: "Chyba serveru" } }, { status: 500 });
  }
}
