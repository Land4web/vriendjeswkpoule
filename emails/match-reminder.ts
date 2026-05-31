import { APP_URL } from "@/lib/email/resend";

export function matchReminderEmail(params: {
  name: string;
  matches: Array<{ homeTeam: string; awayTeam: string; time: string; id: string }>;
}) {
  const predictionsUrl = `${APP_URL}/wedstrijden`;

  const matchList = params.matches
    .map(
      (m) =>
        `<tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #374151;">
            <strong>${m.homeTeam}</strong> vs <strong>${m.awayTeam}</strong>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; text-align: right; white-space: nowrap;">
            ${m.time}
          </td>
        </tr>`
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 24px;">
      <div style="font-size: 40px; margin-bottom: 8px;">⏰</div>
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #0a0a0a;">Vergeet je voorspellingen niet!</h1>
    </div>

    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Hey <strong>${params.name}</strong>, de volgende wedstrijd${params.matches.length > 1 ? "en beginnen" : " begint"} binnenkort en je hebt er nog geen voorspelling voor ingevuld:
    </p>

    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      ${matchList}
    </table>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${predictionsUrl}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        Voorspelling invullen
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Na de aftrap kun je niet meer wijzigen.
    </p>
  </div>
</body>
</html>`;

  const text = `Hey ${params.name}, vergeet je voorspellingen niet!\n\n${params.matches.map((m) => `${m.homeTeam} vs ${m.awayTeam} — ${m.time}`).join("\n")}\n\nVoorspel op: ${predictionsUrl}`;

  return { html, text, subject: `⏰ Voorspel snel — wedstrijd${params.matches.length > 1 ? "en beginnen" : " begint"} binnenkort!` };
}
