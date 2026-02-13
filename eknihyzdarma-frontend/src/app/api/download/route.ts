import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://eknihyzdarma-backend-1.onrender.com";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId || typeof documentId !== "string") {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    // Get current download count
    const getRes = await fetch(
      `${STRAPI_URL}/api/books?filters[documentId][$eq]=${documentId}&fields[0]=downloads`,
      {
        headers: STRAPI_TOKEN
          ? { Authorization: `Bearer ${STRAPI_TOKEN}` }
          : {},
      }
    );

    if (!getRes.ok) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const getData = await getRes.json();
    const book = getData.data?.[0];
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const currentDownloads = book.downloads || 0;

    // Increment download count
    const putRes = await fetch(
      `${STRAPI_URL}/api/books/${book.documentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(STRAPI_TOKEN
            ? { Authorization: `Bearer ${STRAPI_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          data: { downloads: currentDownloads + 1 },
        }),
      }
    );

    if (!putRes.ok) {
      return NextResponse.json(
        { error: "Failed to update" },
        { status: 500 }
      );
    }

    return NextResponse.json({ downloads: currentDownloads + 1 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
