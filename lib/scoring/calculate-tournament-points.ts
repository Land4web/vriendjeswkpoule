import { createServiceClient } from "@/lib/supabase/server";

interface TournamentResults {
  championTeamId: string | null;
  runnerUpTeamId: string | null;
  thirdPlaceTeamId: string | null;
  topScorerId: string | null;
}

export async function calculateTournamentPoints(results: TournamentResults): Promise<void> {
  const supabase = await createServiceClient();

  // Haal puntenconfiguratie op
  const { data: settingsData } = await supabase.from("settings").select("key, value");
  const settings = new Map((settingsData ?? []).map((s) => [s.key, (s.value as { value: number }).value]));
  const config = {
    champion: settings.get("points_champion") ?? 15,
    runnerUp: settings.get("points_runner_up") ?? 10,
    thirdPlace: settings.get("points_third_place") ?? 5,
    topScorer: settings.get("points_top_scorer") ?? 10,
  };

  // Haal alle toernooivoorspellingen op
  const { data: predictions } = await supabase
    .from("tournament_predictions")
    .select("*")
    .eq("locked", true);

  if (!predictions?.length) return;

  for (const pred of predictions) {
    let championPoints = 0;
    let runnerUpPoints = 0;
    let thirdPlacePoints = 0;
    let topScorerPoints = 0;

    if (results.championTeamId && pred.champion_team_id === results.championTeamId) {
      championPoints = config.champion;
    }
    if (results.runnerUpTeamId && pred.runner_up_team_id === results.runnerUpTeamId) {
      runnerUpPoints = config.runnerUp;
    }
    if (results.thirdPlaceTeamId && pred.third_place_team_id === results.thirdPlaceTeamId) {
      thirdPlacePoints = config.thirdPlace;
    }
    if (results.topScorerId && pred.top_scorer_id === results.topScorerId) {
      topScorerPoints = config.topScorer;
    }

    const totalBonus = championPoints + runnerUpPoints + thirdPlacePoints + topScorerPoints;

    // Update toernooivoorspelling met punten
    await supabase
      .from("tournament_predictions")
      .update({
        champion_points: championPoints,
        runner_up_points: runnerUpPoints,
        third_place_points: thirdPlacePoints,
        top_scorer_points: topScorerPoints,
        updated_at: new Date().toISOString(),
      })
      .eq("id", pred.id);

    // Voeg toe aan puntenhistorie
    if (totalBonus > 0) {
      await supabase.from("points_history").insert({
        user_id: pred.user_id,
        tournament_prediction_id: pred.id,
        points: totalBonus,
        reason: "tournament_bonus",
      });
    }

    // Update standings
    const { data: standing } = await supabase
      .from("standings")
      .select("total_points, tournament_points")
      .eq("user_id", pred.user_id)
      .single();

    if (standing) {
      await supabase
        .from("standings")
        .update({
          total_points: standing.total_points + totalBonus,
          tournament_points: standing.tournament_points + totalBonus,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", pred.user_id);
    }
  }
}
