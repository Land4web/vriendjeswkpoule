import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatMatchTime, getStageLabel, getStatusLabel } from "@/lib/utils/match";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Profiel + standing ophalen
  const [{ data: profile }, { data: standing }] = await Promise.all([
    supabase.from("profiles").select("full_name, username").eq("id", user.id).single(),
    supabase.from("standings").select("total_points, rank, previous_rank").eq("user_id", user.id).single(),
  ]);

  // Komende 5 wedstrijden
  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select("id, scheduled_at, stage, group_name, status, home_team_id, away_team_id, home_score, away_score")
    .in("status", ["SCHEDULED", "TIMED"])
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(5);

  // Recente resultaten alvast ophalen voor team-IDs
  const { data: recentPredictions } = await supabase
    .from("predictions")
    .select("match_id, home_score, away_score, points_awarded")
    .eq("user_id", user.id)
    .not("points_awarded", "is", null)
    .order("updated_at", { ascending: false })
    .limit(5);

  const recentMatchIds = (recentPredictions ?? []).map((p) => p.match_id);
  const { data: recentMatches } = await supabase
    .from("matches")
    .select("id, home_team_id, away_team_id, home_score, away_score, scheduled_at")
    .in("id", recentMatchIds.length > 0 ? recentMatchIds : ["00000000-0000-0000-0000-000000000000"]);

  const recentMatchMap = new Map((recentMatches ?? []).map((m) => [m.id, m]));

  // Team info voor komende én recente wedstrijden
  const teamIds = [
    ...(upcomingMatches?.flatMap((m) => [m.home_team_id, m.away_team_id]) ?? []),
    ...(recentMatches?.flatMap((m) => [m.home_team_id, m.away_team_id]) ?? []),
  ].filter(Boolean) as string[];

  const uniqueTeamIds = [...new Set(teamIds)];
  const { data: teamsData } = uniqueTeamIds.length > 0
    ? await supabase.from("teams").select("id, name, short_name, flag_url").in("id", uniqueTeamIds)
    : { data: [] };

  const teamsMap = new Map((teamsData ?? []).map((t) => [t.id, t]));

  // Eigen voorspellingen voor komende wedstrijden
  const upcomingIds = (upcomingMatches ?? []).map((m) => m.id);
  const { data: myPredictions } = await supabase
    .from("predictions")
    .select("match_id, home_score, away_score")
    .eq("user_id", user.id)
    .in("match_id", upcomingIds);

  const predMap = new Map((myPredictions ?? []).map((p) => [p.match_id, p]));

  // Missende voorspellingen voor wedstrijden <48u
  const in48h = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  const missingPredictions = (upcomingMatches ?? []).filter(
    (m) => m.scheduled_at <= in48h && !predMap.has(m.id)
  );

  // Toernooivoorspelling check
  const { data: tournamentPred } = await supabase
    .from("tournament_predictions")
    .select("id, locked, champion_team_id, runner_up_team_id, third_place_team_id, top_scorer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasIncompleteTournament =
    !tournamentPred ||
    !tournamentPred.champion_team_id ||
    !tournamentPred.runner_up_team_id ||
    !tournamentPred.third_place_team_id ||
    !tournamentPred.top_scorer_id;

  // Ranglijst
  const { data: standings } = await supabase
    .from("standings")
    .select("user_id, total_points, correct_exact, correct_winner, rank, previous_rank")
    .order("total_points", { ascending: false })
    .order("correct_exact", { ascending: false });

  const standingUserIds = (standings ?? []).map((s) => s.user_id);
  const { data: standingProfiles } = standingUserIds.length > 0
    ? await supabase.from("profiles").select("id, full_name, username").in("id", standingUserIds)
    : { data: [] };
  const standingProfileMap = new Map((standingProfiles ?? []).map((p) => [p.id, p]));


  const rankChange = standing?.previous_rank && standing?.rank
    ? standing.previous_rank - standing.rank
    : 0;

  return (
    <div className="space-y-6">
      {/* Welkomst + positie */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hoi, {profile?.full_name?.split(" ")[0]}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">WK Poule 2026 — FIFA World Cup</p>
        </div>

        <Card className="shrink-0">
          <CardContent className="pt-4 pb-4 flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{standing?.total_points ?? 0}</p>
              <p className="text-xs text-muted-foreground">punten</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">
                {standing?.rank ? `#${standing.rank}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {rankChange > 0 ? `▲${rankChange}` : rankChange < 0 ? `▼${Math.abs(rankChange)}` : "positie"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deadline-banner */}
      {hasIncompleteTournament && !tournamentPred?.locked && (
        <div className="rounded-lg p-4 flex items-start gap-3" style={{background: "#fff8e6", border: "1px solid #f5c842"}}>
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-medium text-sm">Toernooivoorspelling nog niet (volledig) ingevuld</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Vergeet niet je kampioen, finalist, derde plek en topscorer te kiezen — goed voor max. 40 punten.
            </p>
            <Link href="/toernooi" className="text-sm font-medium text-primary hover:underline mt-1 inline-block">
              Invullen →
            </Link>
          </div>
        </div>
      )}

      {/* Missende voorspellingen */}
      {missingPredictions.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span>⏰</span> Snel invullen!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {missingPredictions.map((m) => {
              const homeTeam = m.home_team_id ? teamsMap.get(m.home_team_id) : null;
              const awayTeam = m.away_team_id ? teamsMap.get(m.away_team_id) : null;
              return (
                <Link
                  key={m.id}
                  href={`/wedstrijden/${m.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">
                    {homeTeam?.name ?? "?"} vs {awayTeam?.name ?? "?"}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatMatchTime(m.scheduled_at)}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Komende wedstrijden */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Komende wedstrijden</span>
            <Link href="/wedstrijden" className="text-sm font-normal text-primary hover:underline">
              Alle wedstrijden →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(upcomingMatches ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Geen wedstrijden gevonden.</p>
          ) : (
            <div className="space-y-2">
              {(upcomingMatches ?? []).map((m) => {
                const homeTeam = m.home_team_id ? teamsMap.get(m.home_team_id) : null;
                const awayTeam = m.away_team_id ? teamsMap.get(m.away_team_id) : null;
                const pred = predMap.get(m.id);
                return (
                  <Link
                    key={m.id}
                    href={`/wedstrijden/${m.id}`}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {homeTeam?.name ?? "?"} vs {awayTeam?.name ?? "?"}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatMatchTime(m.scheduled_at)}</p>
                    </div>
                    <div className="shrink-0">
                      {pred ? (
                        <Badge variant="secondary" className="text-xs">
                          {pred.home_score}-{pred.away_score}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-muted-foreground">
                          Nog invullen
                        </Badge>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recente resultaten */}
      {(recentPredictions ?? []).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recente resultaten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(recentPredictions ?? []).map((pred) => {
                const match = recentMatchMap.get(pred.match_id);
                if (!match) return null;
                const homeTeam = match.home_team_id ? teamsMap.get(match.home_team_id) : null;
                const awayTeam = match.away_team_id ? teamsMap.get(match.away_team_id) : null;
                return (
                  <div
                    key={pred.match_id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {homeTeam?.name ?? "?"} vs {awayTeam?.name ?? "?"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uitslag: {match.home_score}-{match.away_score} | Voorspelling: {pred.home_score}-{pred.away_score}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0 text-white"
                      variant={pred.points_awarded === 0 ? "secondary" : "default"}
                    >
                      {pred.points_awarded} pt
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Ranglijst */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>🏆 Ranglijst</span>
            <Link href="/ranglijst" className="text-sm font-normal text-primary hover:underline">
              Volledig overzicht →
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(standings ?? []).length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              Nog geen scores — de ranglijst verschijnt zodra de eerste wedstrijd afgelopen is.
            </p>
          ) : (
            <div className="divide-y">
              {(standings ?? []).map((s, index) => {
                const profile = standingProfileMap.get(s.user_id);
                const isMe = s.user_id === user.id;
                const rankChange = s.previous_rank ? s.previous_rank - (s.rank ?? index + 1) : 0;
                return (
                  <div
                    key={s.user_id}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-primary/5" : ""}`}
                  >
                    <div className="w-7 text-center shrink-0">
                      {index === 0 ? <span>🥇</span> : index === 1 ? <span>🥈</span> : index === 2 ? <span>🥉</span> : (
                        <span className="text-sm text-muted-foreground">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? "text-primary" : ""}`}>
                        {profile?.full_name ?? "Onbekend"}
                        {isMe && <span className="ml-1 text-xs">(jij)</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {rankChange !== 0 && (
                        <span className={`text-xs font-medium ${rankChange > 0 ? "text-green-500" : "text-red-500"}`}>
                          {rankChange > 0 ? `▲${rankChange}` : `▼${Math.abs(rankChange)}`}
                        </span>
                      )}
                      <Badge variant={isMe ? "default" : "secondary"} className="tabular-nums">
                        {s.total_points} pt
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
