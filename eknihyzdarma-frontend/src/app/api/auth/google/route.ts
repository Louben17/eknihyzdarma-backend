import { NextResponse } from "next/server";

const STRAPI_PUBLIC_URL = process.env.STRAPI_PUBLIC_URL || process.env.STRAPI_URL || "http://localhost:1337";

export async function GET() {
  return NextResponse.redirect(`${STRAPI_PUBLIC_URL}/api/connect/google`);
}
