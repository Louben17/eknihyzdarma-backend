const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'https://eknihyzdarma-backend-1.onrender.com';

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
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Přihlášení se nezdařilo');
  }

  return res.json();
}

export async function strapiRegister(email: string, password: string): Promise<AuthResponse> {
  // Strapi vyžaduje username – použijeme část emailu před @
  const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

  const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Registrace se nezdařila');
  }

  return res.json();
}

export async function strapiMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${STRAPI_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Token je neplatný');

  return res.json();
}
