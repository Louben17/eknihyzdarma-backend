"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface RatingData {
  average: number;
  count: number;
  userScore: number | null;
}

export default function StarRating({ bookDocumentId }: { bookDocumentId: string }) {
  const [data, setData] = useState<RatingData | null>(null);
  const [hovered, setHovered] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [justRated, setJustRated] = useState(false);

  useEffect(() => {
    fetch(`/api/rate?bookDocumentId=${bookDocumentId}`)
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, [bookDocumentId]);

  const handleRate = async (score: number) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookDocumentId, score }),
      });
      const newData: RatingData = await res.json();
      setData(newData);
      setJustRated(true);
    } catch {}
    setSubmitting(false);
  };

  // Počet hvězdiček pro zobrazení průměru (zaokrouhlení na 0.5)
  const displayAverage = data?.average ?? 0;
  const activeScore = hovered || data?.userScore || 0;

  const starFill = (star: number): "full" | "half" | "empty" => {
    if (activeScore > 0) {
      return star <= activeScore ? "full" : "empty";
    }
    if (star <= Math.floor(displayAverage)) return "full";
    if (star === Math.ceil(displayAverage) && displayAverage % 1 >= 0.25) return "half";
    return "empty";
  };

  const countLabel = (count: number) => {
    if (count === 1) return "hodnocení";
    if (count >= 2 && count <= 4) return "hodnocení";
    return "hodnocení";
  };

  return (
    <div className="space-y-1.5">
      {/* Hvězdičky */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = starFill(star);
          return (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              disabled={submitting}
              className="focus:outline-none disabled:cursor-wait transition-transform hover:scale-110"
              aria-label={`Ohodnotit ${star} hvězdičkami`}
            >
              {fill === "full" ? (
                <Star className="h-6 w-6 fill-yellow-400 text-yellow-400 transition-colors" />
              ) : fill === "half" ? (
                <span className="relative inline-block h-6 w-6">
                  <Star className="absolute inset-0 h-6 w-6 text-gray-300" />
                  <span className="absolute inset-0 overflow-hidden w-1/2">
                    <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                  </span>
                </span>
              ) : (
                <Star className="h-6 w-6 text-gray-300 transition-colors hover:text-yellow-300" />
              )}
            </button>
          );
        })}

        {/* Průměr + počet */}
        {data && (
          <span className="ml-2 text-sm text-gray-500">
            {data.count === 0 ? (
              "Zatím bez hodnocení – buďte první!"
            ) : (
              <>
                <span className="font-medium text-gray-700">{data.average.toFixed(1)}</span>
                <span className="text-gray-400"> / 5</span>
                <span className="text-gray-400 ml-1">
                  ({data.count} {countLabel(data.count)})
                </span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Stav uživatele */}
      {data?.userScore && (
        <p className="text-xs text-gray-400">
          {justRated ? "Díky za hodnocení! " : ""}
          Vaše hodnocení: {data.userScore}★
          <span className="ml-1 text-gray-300">· kliknutím změníte</span>
        </p>
      )}

      {!data?.userScore && data && data.count > 0 && !hovered && (
        <p className="text-xs text-gray-400">Klikněte na hvězdičku pro ohodnocení</p>
      )}
    </div>
  );
}
