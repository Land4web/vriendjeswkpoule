import { createServiceClient } from "@/lib/supabase/server";
import { fetchTeams } from "@/lib/api/football-data";

export async function syncTeams(competitionId?: string): Promise<{ processed: number }> {
  const supabase = await createServiceClient();
  const teams = await fetchTeams(competitionId);

  let processed = 0;
  for (const team of teams) {
    const { error } = await supabase.from("teams").upsert(
      {
        external_id: String(team.id),
        name: team.name,
        short_name: team.shortName,
        tla: team.tla,
        flag_url: team.crest,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "external_id" }
    );
    if (!error) processed++;
  }

  return { processed };
}
