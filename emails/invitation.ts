import { APP_URL } from "@/lib/email/resend";

export function invitationEmail(params: {
  email: string;
  token: string;
  invitedByName: string;
  paymentUrl?: string;
}) {
  const url = `${APP_URL}/registreren?token=${params.token}`;
  const paymentBlock = params.paymentUrl ? `
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 20px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #92400e;">💰 Inleg betalen</p>
      <p style="margin: 0 0 16px; font-size: 14px; color: #78350f;">Vergeet niet de inleg te betalen om mee te doen!</p>
      <a href="${params.paymentUrl}" style="display: inline-block; background: #f59e0b; color: white; font-weight: 600; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
        Inleg betalen
      </a>
    </div>` : "";

  const html = `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
  <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; width: 56px; height: 56px; background: #1e3a5f; border-radius: 50%; line-height: 56px; font-size: 28px; margin-bottom: 16px;">⚽</div>
      <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #0a0a0a;">De vriendjes WK poule 2026</h1>
      <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">FIFA World Cup — VS / Canada / Mexico</p>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Hey! <strong>${params.invitedByName}</strong> heeft je uitgenodigd om mee te doen aan de WK-poule.
    </p>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
      Maak je account aan en begin direct met voorspellen. Heel veel weinig succes!
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background: #1e3a5f; color: white; font-weight: 600; font-size: 16px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
        Account aanmaken
      </a>
    </div>

    ${paymentBlock}

    <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
      Of kopieer deze link in je browser:<br>
      <a href="${url}" style="color: #1e3a5f; word-break: break-all;">${url}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Deze uitnodiging is 7 dagen geldig. Als je dit niet verwachtte, kun je deze mail negeren.
    </p>
  </div>
</body>
</html>`;

  const paymentText = params.paymentUrl ? `\n\n💰 Inleg betalen: ${params.paymentUrl}` : "";
  const text = `Je bent uitgenodigd voor de Vriendjes WK poule 2026!\n\n${params.invitedByName} heeft je uitgenodigd.\n\nMaak je account aan en begin direct met voorspellen. Heel veel weinig succes!\n\nAccount aanmaken: ${url}${paymentText}\n\nDeze uitnodiging is 7 dagen geldig.`;

  return { html, text, subject: "Je bent uitgenodigd voor de Vriendjes WK poule 2026!" };
}
