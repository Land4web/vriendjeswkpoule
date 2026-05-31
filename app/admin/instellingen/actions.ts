"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function saveSettings(formData: FormData) {
  const supabase = await createServiceClient();

  const pointsKeys = [
    "points_exact",
    "points_winner",
    "points_champion",
    "points_runner_up",
    "points_third_place",
    "points_top_scorer",
  ];

  for (const key of pointsKeys) {
    const value = parseInt(formData.get(key) as string, 10);
    if (isNaN(value)) continue;
    await supabase
      .from("settings")
      .update({ value: { value } })
      .eq("key", key);
  }

  // Deadline
  const deadlineRaw = formData.get("tournament_prediction_deadline") as string;
  if (deadlineRaw) {
    const deadline = new Date(deadlineRaw).toISOString();
    await supabase
      .from("settings")
      .update({ value: { value: deadline } })
      .eq("key", "tournament_prediction_deadline");
  }

  // API-sleutel (alleen opslaan als ingevuld)
  const apiKey = formData.get("api_football_key") as string;
  if (apiKey?.trim()) {
    // Sla op als env-variabele — in productie via Vercel dashboard instellen
    // Hier bewaren we de sleutel in de settings tabel voor admin-gebruik
    await supabase
      .from("settings")
      .upsert({ key: "football_data_api_key", value: { value: apiKey.trim() } }, { onConflict: "key" });
  }

  revalidatePath("/admin/instellingen");
  return { success: true, error: null };
}
