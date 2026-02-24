"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { addToLibrary } from "@/lib/user-api";

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
  const { token } = useAuth();

  const handleDownload = () => {
    // Track download in background
    fetch("/api/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    }).catch(() => {});

    // Add to user library if logged in
    if (token) {
      addToLibrary(token, documentId).catch(() => {});
    }

    // Open file download
    window.open(fileUrl, "_blank");
  };

  return (
    <Button variant="default" className="gap-2" onClick={handleDownload}>
      <Download className="h-4 w-4" />
      {label}
      {size && <span className="text-xs opacity-70">({size})</span>}
    </Button>
  );
}
