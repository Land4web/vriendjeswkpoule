import { createServiceClient } from "@/lib/supabase/server";
import { fetchMatches, mapStage } from "@/lib/api/football-data";

export async function syncMatches(competitionId?: string): Promise<{ processed: number }> {
  const supabase = await createServiceClient();
  const matches = await fetchMatches(competitionId);

  // Laad alle teams in geheugen voor snelle lookup
  const { data: teamsData } = await supabase.from("teams").select("id, external_id");
  const teamMap = new Map((teamsData ?? []).map((t) => [t.external_id, t.id]));

  let processed = 0;
  for (const match of matches) {
    const homeTeamId = match.homeTeam ? teamMap.get(String(match.homeTeam.id)) ?? null : null;
    const awayTeamId = match.awayTeam ? teamMap.get(String(match.awayTeam.id)) ?? null : null;

    const { error } = await supabase.from("matches").upsert(
      {
        external_id: String(match.id),
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        scheduled_at: match.utcDate,
        stage: mapStage(match.stage),
        group_name: match.group ?? null,
        matchday: match.matchday ?? null,
        status: match.status,
        venue: match.venue ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "external_id" }
    );
    if (!error) processed++;
  }

  return { processed };
}
