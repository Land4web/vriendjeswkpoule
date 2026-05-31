import { APP_URL } from "@/lib/email/resend";

export function welcomeEmail(params: { name: string; email: string }) {
  const dashboardUrl = `${APP_URL}/dashboard`;

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 56px; height: 56px; background: #16a34a; border-radius: 50%; line-height: 56px; font-size: 28px; margin-bottom: 16px;">⚽</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a;">Welkom bij WK Poule 2026!</h1>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hey <strong>${params.name}</strong>! Je account is aangemaakt. Je kunt nu beginnen met voorspellen.
    </p>

    <ul style="color: #374151; font-size: 15px; line-height: 2;">
      <li>📅 Vul je toernooivoorspellingen in vóór de deadline</li>
      <li>⚽ Voorspel elke wedstrijd tot de aftrap</li>
      <li>🏆 Volg je positie op de ranglijst</li>
    </ul>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${dashboardUrl}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
        Naar het dashboard
      </a>
    </div>
  </div>
</body>
</html>`;

  const text = `Welkom bij WK Poule 2026, ${params.name}!\n\nJe account is aangemaakt.\n\nGa naar het dashboard: ${dashboardUrl}`;

  return { html, text, subject: "Welkom bij WK Poule 2026! ⚽" };
}
