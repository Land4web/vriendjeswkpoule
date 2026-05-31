"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { correctScore } from "./actions";

interface MatchOption {
  id: string;
  label: string;
  homeScore: number | null;
  awayScore: number | null;
}

interface Props {
  matches: MatchOption[];
}

export default function CorrectieForm({ matches }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [loading, setLoading] = useState(false);

  function onMatchSelect(id: string | null) {
    if (!id) return;
    setSelectedId(id);
    const m = matches.find((m) => m.id === id);
    if (m) {
      setHomeScore(m.homeScore?.toString() ?? "");
      setAwayScore(m.awayScore?.toString() ?? "");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("match_id", selectedId);
    formData.set("home_score", homeScore);
    formData.set("away_score", awayScore);
    const result = await correctScore(formData);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Uitslag gecorrigeerd en puntentelling bijgewerkt!");
  }

  return (
    <Card className="max-w-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Uitslag aanpassen</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Wedstrijd</Label>
            <Select value={selectedId} onValueChange={onMatchSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Kies een wedstrijd…" />
              </SelectTrigger>
              <SelectContent>
                {matches.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="home_score">Thuis</Label>
              <Input
                id="home_score"
                type="number"
                min="0"
                max="99"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                className="text-center"
                required
              />
            </div>
            <span className="text-lg font-bold mt-6">–</span>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="away_score">Uit</Label>
              <Input
                id="away_score"
                type="number"
                min="0"
                max="99"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                className="text-center"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading || !selectedId} className="w-full">
            {loading ? "Bezig met herberekening…" : "Correctie toepassen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
