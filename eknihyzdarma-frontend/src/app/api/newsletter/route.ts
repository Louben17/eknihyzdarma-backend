import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Neplatný e-mail" }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Newsletter není nakonfigurován" }, { status: 500 });
  }

  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
      "accept": "application/json",
    },
    body: JSON.stringify({
      email,
      updateEnabled: false,
    }),
  });

  // 201 = created, 204 = already exists (updateEnabled: false)
  if (res.status === 201 || res.status === 204) {
    return NextResponse.json({ success: true });
  }

  // 400 z Brevo může znamenat, že kontakt již existuje
  if (res.status === 400) {
    const body = await res.json().catch(() => ({}));
    if (body?.code === "duplicate_parameter") {
      return NextResponse.json({ success: true, duplicate: true });
    }
  }

  return NextResponse.json({ error: "Chyba při registraci" }, { status: 500 });
}
