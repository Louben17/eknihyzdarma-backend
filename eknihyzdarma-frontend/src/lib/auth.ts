export interface AuthUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

export async function strapiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Přihlášení se nezdařilo");
  }
  return data;
}

export async function strapiRegister(email: string, password: string): Promise<AuthResponse> {
  // Strapi vyžaduje username – použijeme část emailu před @
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_");

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || "Registrace se nezdařila");
  }
  return data;
}

export async function strapiMe(token: string): Promise<AuthUser> {
  const res = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Token je neplatný");
  return res.json();
}
