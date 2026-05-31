"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { savePrediction } from "./actions";

interface Props {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  existingPrediction: { home_score: number; away_score: number } | null;
}

export default function PredictionForm({ matchId, homeTeamName, awayTeamName, existingPrediction }: Props) {
  const [homeScore, setHomeScore] = useState(existingPrediction?.home_score?.toString() ?? "");
  const [awayScore, setAwayScore] = useState(existingPrediction?.away_score?.toString() ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("match_id", matchId);
    formData.set("home_score", homeScore);
    formData.set("away_score", awayScore);

    const result = await savePrediction(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Voorspelling opgeslagen!");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">{homeTeamName}</Label>
          <Input
            type="number"
            min="0"
            max="20"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="text-center text-2xl font-bold h-16"
            placeholder="0"
            required
          />
        </div>

        <span className="text-2xl font-bold text-muted-foreground pt-5">–</span>

        <div className="flex-1 space-y-1">
          <Label className="text-xs text-muted-foreground">{awayTeamName}</Label>
          <Input
            type="number"
            min="0"
            max="20"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="text-center text-2xl font-bold h-16"
            placeholder="0"
            required
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Stand na 90 minuten reguliere speeltijd (verlengingen tellen niet mee).
      </p>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Opslaan…" : existingPrediction ? "Voorspelling bijwerken" : "Voorspelling opslaan"}
      </Button>
    </form>
  );
}
