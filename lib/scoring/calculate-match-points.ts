import { createServiceClient } from "@/lib/supabase/server";

async function getPointsConfig(supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const { data } = await supabase.from("settings").select("key, value");
  const map = new Map((data ?? []).map((s) => [s.key, (s.value as { value: number }).value]));
  return {
    exact: map.get("points_exact") ?? 5,
    winner: map.get("points_winner") ?? 3,
  };
}

export async function calculateAndSaveMatchPoints(
  matchId: string,
  officialHome: number,
  officialAway: number
): Promise<void> {
  const supabase = await createServiceClient();

  // Idempotentie check: al verwerkt?
  const { data: match } = await supabase
    .from("matches")
    .select("score_processed")
    .eq("id", matchId)
    .single();

  if (!match || match.score_processed) return;

  const config = await getPointsConfig(supabase);

  // Bepaal officieel resultaat
  const officialResult: "home" | "away" | "draw" =
    officialHome > officialAway ? "home" : officialHome < officialAway ? "away" : "draw";

  // Haal alle voorspellingen op
  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, user_id, home_score, away_score")
    .eq("match_id", matchId)
    .is("points_awarded", null);

  if (!predictions?.length) {
    // Geen voorspellingen — markeer als verwerkt
    await supabase
      .from("matches")
      .update({ score_processed: true, updated_at: new Date().toISOString() })
      .eq("id", matchId);
    return;
  }

  const userUpdates: Map<string, { points: number; exact: boolean; winner: boolean }> = new Map();

  for (const pred of predictions) {
    const predResult: "home" | "away" | "draw" =
      pred.home_score > pred.away_score ? "home" : pred.home_score < pred.away_score ? "away" : "draw";

    let points = 0;
    let isExact = false;
    let isWinner = false;

    if (pred.home_score === officialHome && pred.away_score === officialAway) {
      points = config.exact;
      isExact = true;
      isWinner = true;
    } else if (predResult === officialResult) {
      points = config.winner;
      isWinner = true;
    }

    // Update voorspelling met punten
    await supabase
      .from("predictions")
      .update({ points_awarded: points, updated_at: new Date().toISOString() })
      .eq("id", pred.id);

    // Sla op in puntenhistorie
    if (points > 0) {
      await supabase.from("points_history").insert({
        user_id: pred.user_id,
        match_id: matchId,
        prediction_id: pred.id,
        points,
        reason: isExact ? "exact" : "winner",
      });
    }

    userUpdates.set(pred.user_id, { points, exact: isExact, winner: isWinner });
  }

  // Update standings voor elke betrokken speler
  await updateStandingsForMatch(supabase, userUpdates);

  // Markeer wedstrijd als verwerkt
  await supabase
    .from("matches")
    .update({ score_processed: true, updated_at: new Date().toISOString() })
    .eq("id", matchId);
}

async function updateStandingsForMatch(
  supabase: Awaited<ReturnType<typeof createServiceClient>>,
  userUpdates: Map<string, { points: number; exact: boolean; winner: boolean }>
) {
  for (const [userId, data] of userUpdates) {
    const { data: current } = await supabase
      .from("standings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (current) {
      await supabase
        .from("standings")
        .update({
          total_points: current.total_points + data.points,
          match_points: current.match_points + data.points,
          correct_exact: current.correct_exact + (data.exact ? 1 : 0),
          correct_winner: current.correct_winner + (data.winner && !data.exact ? 1 : 0),
          predictions_made: current.predictions_made + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);
    } else {
      await supabase.from("standings").insert({
        user_id: userId,
        total_points: data.points,
        match_points: data.points,
        correct_exact: data.exact ? 1 : 0,
        correct_winner: data.winner && !data.exact ? 1 : 0,
        predictions_made: 1,
      });
    }
  }

  // Herbereken rang voor alle spelers
  await recalculateRanks(supabase);
}

async function recalculateRanks(supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const { data: allStandings } = await supabase
    .from("standings")
    .select("id, user_id, total_points, correct_exact, correct_winner, rank")
    .order("total_points", { ascending: false })
    .order("correct_exact", { ascending: false })
    .order("correct_winner", { ascending: false });

  if (!allStandings) return;

  for (let i = 0; i < allStandings.length; i++) {
    const standing = allStandings[i];
    const newRank = i + 1;
    if (standing.rank !== newRank) {
      await supabase
        .from("standings")
        .update({ previous_rank: standing.rank, rank: newRank, updated_at: new Date().toISOString() })
        .eq("id", standing.id);
    }
  }
}
