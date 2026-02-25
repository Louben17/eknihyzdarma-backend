"use client";

import { useEffect } from "react";

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://46.225.238.52:1337";

export default function ArticleViewTracker({ documentId }: { documentId: string }) {
  useEffect(() => {
    fetch(`${STRAPI_URL}/api/articles/${documentId}/view`, {
      method: "POST",
    }).catch(() => {});
  }, [documentId]);

  return null;
}