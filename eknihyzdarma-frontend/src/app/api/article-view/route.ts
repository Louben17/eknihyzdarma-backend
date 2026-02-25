import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.STRAPI_URL ||
  "http://localhost:1337";

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    await fetch(`${STRAPI_URL}/api/articles/${documentId}/view`, {
      method: "POST",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
