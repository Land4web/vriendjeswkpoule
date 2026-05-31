"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { generateToken, getExpiresAt } from "@/lib/invitations";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { invitationEmail } from "@/emails/invitation";

export async function createInvitation(formData: FormData) {
  const supabase = await createClient();
  const serviceSupabase = await createServiceClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Niet ingelogd." };

  const { data: profile } = await serviceSupabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Geen toegang." };

  const email = (formData.get("email") as string).toLowerCase().trim();
  if (!email) return { error: "E-mailadres is vereist." };

  // Controleer of er al een actieve uitnodiging is
  const { data: existing } = await serviceSupabase
    .from("invitations")
    .select("id")
    .eq("email", email)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .maybeSingle();

  if (existing) {
    return { error: "Er is al een openstaande uitnodiging voor dit e-mailadres." };
  }

  const token = generateToken();
  const expiresAt = getExpiresAt(7);

  const { error: insertError } = await serviceSupabase.from("invitations").insert({
    email,
    token,
    invited_by: user.id,
    expires_at: expiresAt,
  });

  if (insertError) return { error: "Uitnodiging aanmaken mislukt." };

  const emailContent = invitationEmail({
    email,
    token,
    invitedByName: profile?.full_name ?? "Beheerder",
  });

  const { error: emailError } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (emailError) {
    return { error: "Uitnodiging aangemaakt, maar e-mail versturen mislukt." };
  }

  return { success: true };
}
