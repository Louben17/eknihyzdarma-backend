"use client";

import { useEffect } from "react";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://eknihyzdarma-backend-1.onrender.com";

export default function ArticleViewTracker({ documentId }: { documentId: string }) {
  useEffect(() => {
    fetch(`${STRAPI_URL}/api/articles/${documentId}/view`, {
      method: "POST",
    }).catch(() => {});
  }, [documentId]);

  return null;
}
