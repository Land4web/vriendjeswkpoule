"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function savePrediction(formData: FormData) {
  const matchId = formData.get("match_id") as string;
  const homeScore = parseInt(formData.get("home_score") as string, 10);
  const awayScore = parseInt(formData.get("away_score") as string, 10);

  if (!matchId || isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return { error: "Ongeldige invoer." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd." };

  // Controleer of wedstrijd nog open is
  const { data: match } = await supabase
    .from("matches")
    .select("scheduled_at, status")
    .eq("id", matchId)
    .single();

  if (!match) return { error: "Wedstrijd niet gevonden." };

  const locked =
    new Date(match.scheduled_at) <= new Date() ||
    !["SCHEDULED", "TIMED"].includes(match.status);

  if (locked) return { error: "Voorspelling vergrendeld — de wedstrijd is al begonnen." };

  // UPSERT voorspelling
  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) return { error: "Opslaan mislukt. Probeer het opnieuw." };

  revalidatePath(`/wedstrijden/${matchId}`);
  revalidatePath("/dashboard");
  return { success: true };
}
