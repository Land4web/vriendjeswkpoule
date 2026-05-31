import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getResend } from "@/lib/email/resend";
import { tournamentDeadlineEmail } from "@/emails/tournament-deadline";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!process.env.SYNC_SECRET || token !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createServiceClient();

    // Check if deadline is in the next 24–25 hours
    const { data: deadlineSetting } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "tournament_prediction_deadline")
      .single();

    if (!deadlineSetting) {
      return NextResponse.json({ success: true, sent: 0, reason: "Geen deadline ingesteld" });
    }

    const deadline = new Date((deadlineSetting.value as { value: string }).value);
    const now = new Date();
    const hoursUntil = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntil < 23 || hoursUntil > 25) {
      return NextResponse.json({
        success: true,
        sent: 0,
        reason: `Deadline is over ${Math.round(hoursUntil)} uur, buiten het 24u-venster`,
      });
    }

    // Get users without tournament predictions
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("is_active", true);

    const { data: existingPredictions } = await supabase
      .from("tournament_predictions")
      .select("user_id");

    const predictedUserIds = new Set((existingPredictions ?? []).map((p) => p.user_id));
    const usersWithoutPrediction = (profiles ?? []).filter((p) => !predictedUserIds.has(p.id));

    const resend = getResend();
    let sent = 0;

    const deadlineStr = deadline.toLocaleString("nl-NL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Amsterdam",
    });

    for (const profile of usersWithoutPrediction) {
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
      const email = authUser?.user?.email;
      if (!email) continue;

      const emailContent = tournamentDeadlineEmail({
        name: profile.full_name,
        deadline: deadlineStr,
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
        // Continue to next user
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Onbekende fout" },
      { status: 500 }
    );
  }
}
