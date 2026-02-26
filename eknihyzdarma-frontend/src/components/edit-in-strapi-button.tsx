"use client";

import { useAuth } from "@/context/auth-context";
import { Pencil } from "lucide-react";

const STRAPI_ADMIN_URL = process.env.NEXT_PUBLIC_STRAPI_ADMIN_URL || "https://api.eknihyzdarma.cz";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

interface EditInStrapiButtonProps {
  documentId: string;
}

export default function EditInStrapiButton({ documentId }: EditInStrapiButtonProps) {
  const { user } = useAuth();

  if (!user || !ADMIN_EMAIL || user.email !== ADMIN_EMAIL) return null;

  const href = `${STRAPI_ADMIN_URL}/admin/content-manager/collection-types/api::book.book/${documentId}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
      title="Upravit v Strapi"
    >
      <Pencil className="h-3.5 w-3.5" />
      Upravit v Strapi
    </a>
  );
}
