import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// GET /api/rate?bookDocumentId=xxx
export async function GET(req: NextRequest) {
  const bookDocumentId = req.nextUrl.searchParams.get("bookDocumentId");
  if (!bookDocumentId) {
    return NextResponse.json({ error: "Chybí bookDocumentId" }, { status: 400 });
  }

  const ip = getClientIp(req);

  try {
    const res = await fetch(
      `${STRAPI_URL}/api/ratings/stats/${bookDocumentId}?ip=${encodeURIComponent(ip)}`,
      { cache: "no-store" }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ average: 0, count: 0, userScore: null });
  }
}

// POST /api/rate
// Body: { bookDocumentId: string, score: number }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bookDocumentId, score } = body;

  if (!bookDocumentId || !score) {
    return NextResponse.json({ error: "Chybí parametry" }, { status: 400 });
  }

  const ip = getClientIp(req);

  try {
    const res = await fetch(`${STRAPI_URL}/api/ratings/upsert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookDocumentId, score, ipAddress: ip }),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Chyba serveru" }, { status: 500 });
  }
}
