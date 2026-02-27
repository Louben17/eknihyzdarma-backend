"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  documentId: string;
  epubUrl: string;
}

export default function GutenbergDownloadButton({ documentId, epubUrl }: Props) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await fetch("/api/download-gutenberg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
    } catch {
      // Tracking neblokuje download
    }
    window.open(epubUrl, "_blank", "noopener,noreferrer");
    setLoading(false);
  };

  return (
    <Button onClick={handleDownload} disabled={loading} className="gap-2">
      <Download className="h-4 w-4" />
      {loading ? "Otevírám..." : "Stáhnout EPUB"}
    </Button>
  );
}
