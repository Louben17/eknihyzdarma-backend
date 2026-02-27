import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export async function POST(request: NextRequest) {
  const { documentId } = await request.json();
  if (!documentId) {
    return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
  }

  try {
    await fetch(`${STRAPI_URL}/api/gutenberg-books/${documentId}/download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Neblokuj download při chybě trackingu
  }

  return NextResponse.json({ success: true });
}
