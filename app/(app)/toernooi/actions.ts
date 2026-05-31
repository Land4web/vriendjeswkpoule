"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveTournamentPrediction(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd." };

  // Check deadline via settings
  const { data: deadlineSetting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "tournament_prediction_deadline")
    .single();

  const deadline = (deadlineSetting?.value as { value: string } | null)?.value;
  if (deadline && new Date(deadline) <= new Date()) {
    return { error: "De deadline voor toernooivoorspellingen is verstreken." };
  }

  // Check of bestaande voorspelling vergrendeld is
  const { data: existing } = await supabase
    .from("tournament_predictions")
    .select("id, locked")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.locked) {
    return { error: "Toernooivoorspellingen zijn vergrendeld." };
  }

  const championTeamId = (formData.get("champion_team_id") as string) || null;
  const runnerUpTeamId = (formData.get("runner_up_team_id") as string) || null;
  const thirdPlaceTeamId = (formData.get("third_place_team_id") as string) || null;
  const topScorerId = (formData.get("top_scorer_id") as string) || null;

  const data = {
    user_id: user.id,
    champion_team_id: championTeamId,
    runner_up_team_id: runnerUpTeamId,
    third_place_team_id: thirdPlaceTeamId,
    top_scorer_id: topScorerId,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("tournament_predictions").update(data).eq("id", existing.id);
  } else {
    await supabase.from("tournament_predictions").insert(data);
  }

  revalidatePath("/toernooi");
  revalidatePath("/dashboard");
  return { success: true };
}
