import { createServiceClient } from "@/lib/supabase/server";
import { fetchScorers } from "@/lib/api/football-data";

export async function syncScorers(competitionId?: string): Promise<{ processed: number }> {
  const supabase = await createServiceClient();
  const scorers = await fetchScorers(competitionId);

  // Team mapping
  const { data: teamsData } = await supabase.from("teams").select("id, external_id");
  const teamMap = new Map((teamsData ?? []).map((t) => [t.external_id, t.id]));

  let processed = 0;
  for (const scorer of scorers) {
    const teamId = teamMap.get(String(scorer.team.id)) ?? null;

    const { error } = await supabase.from("scorers").upsert(
      {
        external_id: String(scorer.player.id),
        name: scorer.player.name,
        team_id: teamId,
        goals: scorer.goals,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "external_id" }
    );
    if (!error) processed++;
  }

  return { processed };
}
