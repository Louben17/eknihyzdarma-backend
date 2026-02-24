"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { toggleFavorite, checkFavorite } from "@/lib/user-api";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  documentId: string;
}

export default function FavoriteButton({ documentId }: FavoriteButtonProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && documentId) {
      checkFavorite(token, documentId).then(setFavorited);
    }
  }, [token, documentId]);

  const handleClick = async () => {
    if (!user || !token) {
      router.push("/prihlasit");
      return;
    }
    setLoading(true);
    try {
      const newState = await toggleFavorite(token, documentId);
      setFavorited(newState);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleClick}
      disabled={loading}
      title={favorited ? "Odebrat z oblíbených" : "Přidat do oblíbených"}
      className={favorited ? "text-brand-purple border-brand-purple/40 hover:bg-brand-purple/10" : "text-gray-400 hover:text-brand-purple hover:border-brand-purple/40"}
    >
      <Heart className={`h-4 w-4 ${favorited ? "fill-brand-purple" : ""}`} />
    </Button>
  );
}
