"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getResend, FROM_EMAIL } from "@/lib/email/resend";
import { welcomeEmail } from "@/emails/welcome";
import type { Invitation } from "@/types";

export async function validateToken(token: string): Promise<Invitation | null> {
  const supabase = await createServiceClient();

  const { data } = await supabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .single();

  return (data as Invitation | null) ?? null;
}

export async function register(formData: FormData) {
  const token = formData.get("token") as string;
  const username = (formData.get("username") as string).trim();
  const firstName = (formData.get("first_name") as string).trim();
  const lastName = (formData.get("last_name") as string).trim();
  const fullName = `${firstName} ${lastName}`.trim();
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("password_confirm") as string;

  if (!token) return { error: "Ongeldige uitnodigingslink." };
  if (!username || username.length < 3) return { error: "Gebruikersnaam moet minimaal 3 tekens zijn." };
  if (!firstName) return { error: "Voornaam is vereist." };
  if (!lastName) return { error: "Achternaam is vereist." };
  if (password.length < 8) return { error: "Wachtwoord moet minimaal 8 tekens zijn." };
  if (password !== passwordConfirm) return { error: "Wachtwoorden komen niet overeen." };

  const serviceSupabase = await createServiceClient();

  // Hervalideer token
  const { data: invitationRaw } = await serviceSupabase
    .from("invitations")
    .select("*")
    .eq("token", token)
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .single();

  const invitation = invitationRaw as Invitation | null;
  if (!invitation) return { error: "Uitnodigingslink is verlopen of al gebruikt." };

  // Controleer uniekheid gebruikersnaam
  const { data: existingUsername } = await serviceSupabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUsername) return { error: "Deze gebruikersnaam is al bezet." };

  // Account aanmaken
  const supabase = await createClient();
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: invitation.email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
        role: "player",
      },
    },
  });

  if (signUpError || !signUpData.user) {
    if (signUpError?.message?.includes("already registered")) {
      return { error: "Dit e-mailadres is al geregistreerd." };
    }
    return { error: "Registratie mislukt. Probeer het opnieuw." };
  }

  // Token markeren als gebruikt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (serviceSupabase as any)
    .from("invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("id", invitation.id);

  // Welkomstmail sturen
  const emailContent = welcomeEmail({ name: fullName, email: invitation.email });
  await getResend().emails.send({
    from: FROM_EMAIL,
    to: invitation.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  redirect("/dashboard");
}
