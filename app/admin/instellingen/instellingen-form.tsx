"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { saveSettings } from "./actions";

interface Props {
  settings: Record<string, string | number>;
}

export default function InstellingenForm({ settings }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await saveSettings(formData);
    setLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Instellingen opgeslagen!");
  }

  const pointFields = [
    { key: "points_exact", label: "Exacte uitslag" },
    { key: "points_winner", label: "Juiste winnaar/gelijkspel" },
    { key: "points_champion", label: "Wereldkampioen" },
    { key: "points_runner_up", label: "Verliezend finalist" },
    { key: "points_third_place", label: "Derde plek" },
    { key: "points_top_scorer", label: "Topscorer" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Puntensysteem</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pointFields.map((field) => (
            <div key={field.key} className="flex items-center gap-4">
              <Label htmlFor={field.key} className="flex-1 text-sm">{field.label}</Label>
              <Input
                id={field.key}
                name={field.key}
                type="number"
                min="0"
                max="100"
                defaultValue={settings[field.key] ?? ""}
                className="w-20 text-center"
                required
              />
              <span className="text-sm text-muted-foreground w-12">punten</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Toernooi-instellingen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tournament_prediction_deadline">Deadline toernooivoorspellingen</Label>
            <Input
              id="tournament_prediction_deadline"
              name="tournament_prediction_deadline"
              type="datetime-local"
              defaultValue={
                settings["tournament_prediction_deadline"]
                  ? new Date(settings["tournament_prediction_deadline"] as string)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
            />
            <p className="text-xs text-muted-foreground">
              Na deze datum worden toernooivoorspellingen vergrendeld.
            </p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="payment_url">Betaallink (optioneel)</Label>
            <Input
              id="payment_url"
              name="payment_url"
              type="url"
              placeholder="https://betaalverzoek.ing.nl/betaalverzoek/?id=..."
              defaultValue={settings["payment_url"] as string ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Wordt als knop meegestuurd in uitnodigingsmails. Bijv. een ING betaalverzoek of Tikkie-link.
            </p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="api_football_key">football-data.org API-sleutel</Label>
            <Input
              id="api_football_key"
              name="api_football_key"
              type="password"
              placeholder="Laat leeg om niet te wijzigen"
              autoComplete="off"
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? "Opslaan…" : "Instellingen opslaan"}
      </Button>
    </form>
  );
}
