import { createServiceClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/email/resend";
import { matchReminderEmail } from "@/emails/match-reminder";

export async function sendMatchReminders(): Promise<{ sent: number; errors: number }> {
  const supabase = await createServiceClient();

  // Find matches starting in the next 2–3 hours that haven't been started
  const now = new Date();
  const windowStart = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const windowEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select("id, home_team_id, away_team_id, scheduled_at, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
    .eq("status", "TIMED")
    .gte("scheduled_at", windowStart.toISOString())
    .lte("scheduled_at", windowEnd.toISOString());

  if (!upcomingMatches || upcomingMatches.length === 0) return { sent: 0, errors: 0 };

  const matchIds = upcomingMatches.map((m) => m.id);

  // Get active users
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("is_active", true);

  if (!profiles || profiles.length === 0) return { sent: 0, errors: 0 };

  // Get existing predictions for these matches
  const userIds = profiles.map((p) => p.id);
  const { data: existingPredictions } = await supabase
    .from("predictions")
    .select("user_id, match_id")
    .in("match_id", matchIds)
    .in("user_id", userIds);

  const predictedSet = new Set(
    (existingPredictions ?? []).map((p) => `${p.user_id}:${p.match_id}`)
  );

  const resend = getResend();
  let sent = 0;
  let errors = 0;

  for (const profile of profiles) {
    const missingMatches = upcomingMatches.filter(
      (m) => !predictedSet.has(`${profile.id}:${m.id}`)
    );
    if (missingMatches.length === 0) continue;

    const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
    const email = authUser?.user?.email;
    if (!email) continue;

    const matchDescriptions = missingMatches.map((m) => ({
      id: m.id,
      homeTeam: (m.home_team as { name: string } | null)?.name ?? "Thuis",
      awayTeam: (m.away_team as { name: string } | null)?.name ?? "Uit",
      time: new Date(m.scheduled_at).toLocaleTimeString("nl-NL", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/Amsterdam",
      }),
    }));

    const emailContent = matchReminderEmail({
      name: profile.full_name,
      matches: matchDescriptions,
    });

    try {
      await resend.emails.send({
        from: "WK Poule 2026 <noreply@wkpoule.nl>",
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
      sent++;
    } catch {
      errors++;
    }
  }

  return { sent, errors };
}
