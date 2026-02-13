"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  fileUrl: string;
  label: string;
  size: string;
  documentId: string;
}

export default function DownloadButton({
  fileUrl,
  label,
  size,
  documentId,
}: DownloadButtonProps) {
  const handleDownload = () => {
    // Track download in background
    fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    }).catch(() => {});

    // Open file download
    window.open(fileUrl, "_blank");
  };

  return (
    <Button variant="default" className="gap-2" onClick={handleDownload}>
      <Download className="h-4 w-4" />
      {label}
      <span className="text-xs opacity-70">({size})</span>
    </Button>
  );
}
