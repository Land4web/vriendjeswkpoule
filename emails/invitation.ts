import { APP_URL } from "@/lib/email/resend";

export function invitationEmail(params: {
  email: string;
  token: string;
  invitedByName: string;
}) {
  const url = `${APP_URL}/registreren?token=${params.token}`;

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 56px; height: 56px; background: #16a34a; border-radius: 50%; line-height: 56px; font-size: 28px; margin-bottom: 16px;">⚽</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a;">WK Poule 2026</h1>
      <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">FIFA World Cup — VS / Canada / Mexico</p>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hey! <strong>${params.invitedByName}</strong> heeft je uitgenodigd om mee te doen aan de WK-poule.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Klik op de knop hieronder om je account aan te maken en te beginnen met voorspellen.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background: #16a34a; color: white; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
        Account aanmaken
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
      Of kopieer deze link in je browser:<br>
      <a href="${url}" style="color: #16a34a; word-break: break-all;">${url}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Deze uitnodiging is 7 dagen geldig. Als je dit niet verwachtte, kun je deze mail negeren.
    </p>
  </div>
</body>
</html>`;

  const text = `Je bent uitgenodigd voor WK Poule 2026!\n\n${params.invitedByName} heeft je uitgenodigd.\n\nAccount aanmaken: ${url}\n\nDeze uitnodiging is 7 dagen geldig.`;

  return { html, text, subject: "Je bent uitgenodigd voor WK Poule 2026! ⚽" };
}
