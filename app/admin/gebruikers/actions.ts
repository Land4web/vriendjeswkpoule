"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";

export async function toggleUserActive(formData: FormData) {
  const supabase = await createServiceClient();
  const profileId = formData.get("profile_id") as string;
  const isActive = formData.get("is_active") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { error: "Bijwerken mislukt." };

  revalidatePath("/admin/gebruikers");
  return { success: true };
}

export async function toggleUserRole(formData: FormData) {
  const supabase = await createServiceClient();
  const profileId = formData.get("profile_id") as string;
  const roleRaw = formData.get("role") as string;

  if (!["player", "admin"].includes(roleRaw)) return { error: "Ongeldige rol." };

  const role = roleRaw as "player" | "admin";

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", profileId);

  if (error) return { error: "Bijwerken mislukt." };

  revalidatePath("/admin/gebruikers");
  return { success: true };
}
