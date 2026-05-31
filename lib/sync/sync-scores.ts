import { createServiceClient } from "@/lib/supabase/server";
import { fetchLiveAndRecentMatches } from "@/lib/api/football-data";
import { calculateAndSaveMatchPoints } from "@/lib/scoring/calculate-match-points";

export async function syncScores(competitionId?: string): Promise<{ processed: number; pointsCalculated: number }> {
  const supabase = await createServiceClient();
  const matches = await fetchLiveAndRecentMatches(competitionId);

  let processed = 0;
  let pointsCalculated = 0;

  for (const fdMatch of matches) {
    const externalId = String(fdMatch.id);

    // Update match status en score
    const { error } = await (supabase as any)
      .from("matches")
      .update({
        status: fdMatch.status,
        home_score: fdMatch.score.fullTime.home ?? undefined,
        away_score: fdMatch.score.fullTime.away ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("external_id", externalId);

    if (!error) processed++;

    // Bereken punten als wedstrijd is afgelopen en nog niet verwerkt
    if (fdMatch.status === "FINISHED" && fdMatch.score.fullTime.home !== null && fdMatch.score.fullTime.away !== null) {
      const { data: dbMatch } = await supabase
        .from("matches")
        .select("id, score_processed")
        .eq("external_id", externalId)
        .single();

      if (dbMatch && !dbMatch.score_processed) {
        await calculateAndSaveMatchPoints(
          dbMatch.id,
          fdMatch.score.fullTime.home,
          fdMatch.score.fullTime.away
        );
        pointsCalculated++;
      }
    }
  }

  return { processed, pointsCalculated };
}
