import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const res = await fetch(`${STRAPI_URL}/api/user-library/my`, {
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ data: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get("authorization");
    const body = await request.json();
    const res = await fetch(`${STRAPI_URL}/api/user-library/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
