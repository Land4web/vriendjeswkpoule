"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd." };

  const fullName = (formData.get("full_name") as string).trim();
  if (!fullName) return { error: "Naam is vereist." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: "Bijwerken mislukt." };

  revalidatePath("/profiel");
  return { success: true };
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (password !== confirm) return { error: "Wachtwoorden komen niet overeen." };
  if (password.length < 8) return { error: "Wachtwoord moet minimaal 8 tekens zijn." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Wachtwoord wijzigen mislukt." };

  return { success: true };
}
