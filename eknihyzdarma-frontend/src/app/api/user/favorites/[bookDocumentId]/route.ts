import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookDocumentId: string }> }
) {
  try {
    const { bookDocumentId } = await params;
    const auth = request.headers.get("authorization");
    const res = await fetch(`${STRAPI_URL}/api/user-favorites/check/${bookDocumentId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ favorited: false }, { status: 500 });
  }
}
