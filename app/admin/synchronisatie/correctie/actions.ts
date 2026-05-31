"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { calculateAndSaveMatchPoints } from "@/lib/scoring/calculate-match-points";

export async function correctScore(formData: FormData) {
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Geen toegang" };

  const matchId = formData.get("match_id") as string;
  const homeScore = parseInt(formData.get("home_score") as string, 10);
  const awayScore = parseInt(formData.get("away_score") as string, 10);

  if (!matchId || isNaN(homeScore) || isNaN(awayScore)) {
    return { error: "Ongeldige invoer" };
  }

  // Reset score_processed so puntentelling can run again
  const { error: updateError } = await (supabase as any)
    .from("matches")
    .update({
      home_score: homeScore,
      away_score: awayScore,
      status: "FINISHED",
      score_processed: false,
    })
    .eq("id", matchId);

  if (updateError) return { error: updateError.message };

  // Re-run point calculation (recalculateRanks is called internally)
  await calculateAndSaveMatchPoints(matchId, homeScore, awayScore);

  revalidatePath("/admin/synchronisatie/correctie");
  revalidatePath("/ranglijst");

  return { success: true };
}
