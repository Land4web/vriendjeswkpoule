"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { saveTournamentPrediction } from "./actions";

interface Team { id: string; name: string; short_name: string; flag_url: string | null }
interface Scorer { id: string; name: string; team_id: string | null }
interface TournamentPred {
  champion_team_id: string | null;
  runner_up_team_id: string | null;
  third_place_team_id: string | null;
  top_scorer_id: string | null;
}

interface Props {
  teams: Team[];
  scorers: Scorer[];
  existingPrediction: TournamentPred | null;
}

export default function TournamentForm({ teams, scorers, existingPrediction }: Props) {
  const [champion, setChampion] = useState(existingPrediction?.champion_team_id ?? "");
  const [runnerUp, setRunnerUp] = useState(existingPrediction?.runner_up_team_id ?? "");
  const [thirdPlace, setThirdPlace] = useState(existingPrediction?.third_place_team_id ?? "");
  const [topScorer, setTopScorer] = useState(existingPrediction?.top_scorer_id ?? "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (champion) formData.set("champion_team_id", champion);
    if (runnerUp) formData.set("runner_up_team_id", runnerUp);
    if (thirdPlace) formData.set("third_place_team_id", thirdPlace);
    if (topScorer) formData.set("top_scorer_id", topScorer);

    const result = await saveTournamentPrediction(formData);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Toernooivoorspelling opgeslagen!");
    }
  }

  const fields = [
    { label: "🥇 Wereldkampioen (15 punten)", value: champion, onChange: (v: string | null) => setChampion(v ?? ""), options: teams },
    { label: "🥈 Verliezend finalist (10 punten)", value: runnerUp, onChange: (v: string | null) => setRunnerUp(v ?? ""), options: teams },
    { label: "🥉 Derde plek (5 punten)", value: thirdPlace, onChange: (v: string | null) => setThirdPlace(v ?? ""), options: teams },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Jouw voorspellingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {fields.map((field) => (
            <div key={field.label} className="space-y-1.5">
              <Label className="text-sm">{field.label}</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecteer een team…" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {field.options.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          <div className="space-y-1.5">
            <Label className="text-sm">⚽ Topscorer (10 punten)</Label>
            <Select value={topScorer} onValueChange={(v) => setTopScorer(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een speler…" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {scorers.length === 0 ? (
                  <SelectItem value="__none" disabled>
                    Nog geen topscorers beschikbaar
                  </SelectItem>
                ) : (
                  scorers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {scorers.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Spelers worden zichtbaar zodra het WK begint en de topscorerslijst beschikbaar is.
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Opslaan…" : existingPrediction ? "Bijwerken" : "Opslaan"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
