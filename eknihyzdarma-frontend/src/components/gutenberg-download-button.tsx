"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  documentId: string;
  label: string;
  url: string;
}

export default function GutenbergDownloadButton({ documentId, label, url }: Props) {
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
    window.open(url, "_blank", "noopener,noreferrer");
    setLoading(false);
  };

  return (
    <Button variant="default" className="gap-2" onClick={handleDownload} disabled={loading}>
      <Download className="h-4 w-4" />
      {loading ? "Otevírám..." : label}
    </Button>
  );
}
