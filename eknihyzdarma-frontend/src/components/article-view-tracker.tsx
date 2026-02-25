"use client";

import { useEffect } from "react";

export default function ArticleViewTracker({ documentId }: { documentId: string }) {
  useEffect(() => {
    fetch("/api/article-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    }).catch(() => {});
  }, [documentId]);

  return null;
}