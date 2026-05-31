import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PredictionForm from "./prediction-form";
import { formatMatchDate, getStageLabel, getStatusLabel, isMatchLocked } from "@/lib/utils/match";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WedstrijdDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: match } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .single();

  if (!match) notFound();

  const [homeTeamRes, awayTeamRes] = await Promise.all([
    match.home_team_id
      ? supabase.from("teams").select("*").eq("id", match.home_team_id).single()
      : Promise.resolve({ data: null }),
    match.away_team_id
      ? supabase.from("teams").select("*").eq("id", match.away_team_id).single()
      : Promise.resolve({ data: null }),
  ]);

  const homeTeam = homeTeamRes.data;
  const awayTeam = awayTeamRes.data;

  const { data: myPrediction } = await supabase
    .from("predictions")
    .select("home_score, away_score, points_awarded")
    .eq("user_id", user.id)
    .eq("match_id", id)
    .maybeSingle();

  const locked = isMatchLocked(match.scheduled_at, match.status);
  const isFinished = match.status === "FINISHED";

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{getStageLabel(match.stage)}{match.group_name ? ` — Groep ${match.group_name}` : ""}</p>
        <h1 className="text-xl font-bold mt-1">{formatMatchDate(match.scheduled_at)}</h1>
      </div>

      {/* Wedstrijd kaart */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6">
            {/* Thuis */}
            <div className="text-center flex-1">
              {homeTeam?.flag_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={homeTeam.flag_url} alt={homeTeam.name} className="h-12 w-auto mx-auto mb-2" />
              )}
              <p className="font-semibold text-sm">{homeTeam?.name ?? "Winnaar ?"}</p>
            </div>

            {/* Score */}
            <div className="text-center">
              {isFinished ? (
                <div className="text-3xl font-bold tabular-nums">
                  {match.home_score} – {match.away_score}
                </div>
              ) : (
                <div className="space-y-1">
                  <Badge variant={match.status === "IN_PLAY" ? "default" : "outline"} className="text-sm">
                    {getStatusLabel(match.status)}
                  </Badge>
                </div>
              )}
            </div>

            {/* Uit */}
            <div className="text-center flex-1">
              {awayTeam?.flag_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={awayTeam.flag_url} alt={awayTeam.name} className="h-12 w-auto mx-auto mb-2" />
              )}
              <p className="font-semibold text-sm">{awayTeam?.name ?? "Winnaar ?"}</p>
            </div>
          </div>

          {match.venue && (
            <p className="text-xs text-center text-muted-foreground mt-4">📍 {match.venue}</p>
          )}
        </CardContent>
      </Card>

      {/* Voorspelling */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Jouw voorspelling</CardTitle>
        </CardHeader>
        <CardContent>
          {locked ? (
            <div className="space-y-3">
              {myPrediction ? (
                <div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm text-muted-foreground">Jouw voorspelling</span>
                    <span className="font-bold text-lg tabular-nums">
                      {myPrediction.home_score} – {myPrediction.away_score}
                    </span>
                  </div>
                  {isFinished && myPrediction.points_awarded !== null && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 mt-2">
                      <span className="text-sm">Punten verdiend</span>
                      <Badge className="text-sm">{myPrediction.points_awarded} punten</Badge>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Je had geen voorspelling ingevuld voor deze wedstrijd.
                </p>
              )}
              {!isFinished && (
                <p className="text-xs text-muted-foreground">
                  Voorspelling vergrendeld — de wedstrijd is begonnen.
                </p>
              )}
            </div>
          ) : (
            <PredictionForm
              matchId={id}
              homeTeamName={homeTeam?.short_name ?? "Thuis"}
              awayTeamName={awayTeam?.short_name ?? "Uit"}
              existingPrediction={myPrediction ?? null}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
