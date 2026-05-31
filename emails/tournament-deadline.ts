import { APP_URL } from "@/lib/email/resend";

export function tournamentDeadlineEmail(params: { name: string; deadline: string }) {
  const tournamentUrl = `${APP_URL}/toernooi`;

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 40px; margin-bottom: 8px;">🏆</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0a0a0a;">Deadline toernooivoorspellingen nadert!</h1>
    </div>

    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Hey <strong>${params.name}</strong>, je hebt nog geen (volledige) toernooivoorspelling ingevuld.
    </p>

    <div style="background: #fef9c3; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0; color: #854d0e; font-size: 14px; font-weight: 600;">
        ⚠️ Deadline: ${params.deadline}
      </p>
    </div>

    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Voorspel nu:
    </p>
    <ul style="color: #374151; font-size: 14px; line-height: 2;">
      <li>🥇 Wereldkampioen (15 punten)</li>
      <li>🥈 Verliezend finalist (10 punten)</li>
      <li>🥉 Derde plek (5 punten)</li>
      <li>⚽ Topscorer (10 punten)</li>
    </ul>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${tournamentUrl}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        Toernooivoorspelling invullen
      </a>
    </div>
  </div>
</body>
</html>`;

  const text = `Hey ${params.name}! De deadline voor toernooivoorspellingen nadert (${params.deadline}).\n\nVul nu in op: ${tournamentUrl}`;

  return { html, text, subject: "⏰ Deadline toernooivoorspellingen nadert!" };
}
