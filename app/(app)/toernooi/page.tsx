import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TournamentForm from "./tournament-form";

export const metadata = { title: "Toernooivoorspellingen" };

export default async function ToernooiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: teams }, { data: scorers }, { data: myPrediction }, { data: deadlineSetting }] =
    await Promise.all([
      supabase.from("teams").select("id, name, short_name, flag_url").order("name"),
      supabase.from("scorers").select("id, name, team_id").order("goals", { ascending: false }),
      supabase
        .from("tournament_predictions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase.from("settings").select("value").eq("key", "tournament_prediction_deadline").single(),
    ]);

  const deadline = (deadlineSetting?.value as { value: string } | null)?.value;
  const isPastDeadline = deadline ? new Date(deadline) <= new Date() : false;
  const isLocked = myPrediction?.locked || isPastDeadline;

  const teamMap = new Map((teams ?? []).map((t) => [t.id, t]));
  const scorerMap = new Map((scorers ?? []).map((s) => [s.id, s]));

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Toernooivoorspellingen</h1>
        {deadline && (
          <p className="text-sm text-muted-foreground mt-1">
            Deadline:{" "}
            {new Date(deadline).toLocaleString("nl-NL", {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border p-3">
          <p className="text-2xl font-bold text-primary">15</p>
          <p className="text-xs text-muted-foreground">Kampioen</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-2xl font-bold text-primary">10</p>
          <p className="text-xs text-muted-foreground">Finalist + Topscorer</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-2xl font-bold text-primary">5</p>
          <p className="text-xs text-muted-foreground">3e plek</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-2xl font-bold text-primary">40</p>
          <p className="text-xs text-muted-foreground">Max. bonus</p>
        </div>
      </div>

      {isLocked ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>🔒</span> Jouw voorspellingen (vergrendeld)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "🥇 Wereldkampioen", teamId: myPrediction?.champion_team_id, points: myPrediction?.champion_points },
              { label: "🥈 Verliezend finalist", teamId: myPrediction?.runner_up_team_id, points: myPrediction?.runner_up_points },
              { label: "🥉 Derde plek", teamId: myPrediction?.third_place_team_id, points: myPrediction?.third_place_points },
            ].map(({ label, teamId, points }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {teamId ? teamMap.get(teamId)?.name ?? "—" : "Niet ingevuld"}
                  </span>
                  {points !== null && points !== undefined && (
                    <Badge variant="default">{points}pt</Badge>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-sm">⚽ Topscorer</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {myPrediction?.top_scorer_id
                    ? scorerMap.get(myPrediction.top_scorer_id)?.name ?? "—"
                    : "Niet ingevuld"}
                </span>
                {myPrediction?.top_scorer_points !== null && myPrediction?.top_scorer_points !== undefined && (
                  <Badge variant="default">{myPrediction.top_scorer_points}pt</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TournamentForm
          teams={teams ?? []}
          scorers={scorers ?? []}
          existingPrediction={myPrediction ?? null}
        />
      )}
    </div>
  );
}
