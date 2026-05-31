import { APP_URL } from "@/lib/email/resend";

export function invitationEmail(params: {
  email: string;
  token: string;
  invitedByName: string;
  paymentUrl?: string;
}) {
  const url = `${APP_URL}/registreren?token=${params.token}`;
  const paymentBlock = params.paymentUrl ? `
    <div style="background: #fff8e6; border: 1px solid #f5c842; border-radius: 12px; padding: 24px 28px; margin: 24px 0; text-align: center;">
      <p style="margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #1c2a3a;">💰 Inleg betalen</p>
      <p style="margin: 0 0 20px; font-size: 14px; color: #5a7090; line-height: 1.5;">Vergeet niet de inleg te betalen om mee te doen!</p>
      <a href="${params.paymentUrl}" style="display: inline-block; background: #e8750a; color: white; font-weight: 700; font-size: 16px; padding: 16px 40px; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 2px 8px rgba(232,117,10,0.35);">
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
      <img src="https://vriendjeswkpoule.nl/logo.png" alt="De vriendjes WK poule 2026" width="160" style="height: auto; margin-bottom: 8px;" />
      <p style="margin: 4px 0 0; color: #6b7280; font-size: 14px;">FIFA World Cup — VS / Canada / Mexico</p>
    </div>

    <p style="color: #1c2a3a; font-size: 16px; line-height: 1.6;">
      Hey! <strong>${params.invitedByName}</strong> heeft je uitgenodigd om mee te doen aan de WK-poule.
    </p>

    <p style="color: #1c2a3a; font-size: 16px; line-height: 1.6;">
      Maak je account aan en begin direct met voorspellen. Heel veel weinig succes!
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${url}" style="display: inline-block; background: #1a3a6b; color: white; font-weight: 700; font-size: 16px; padding: 16px 40px; border-radius: 10px; text-decoration: none; letter-spacing: 0.01em; box-shadow: 0 2px 8px rgba(26,58,107,0.35);">
        Account aanmaken
      </a>
    </div>

    ${paymentBlock}

    <p style="color: #8a9bb0; font-size: 13px; line-height: 1.5;">
      Of kopieer deze link in je browser:<br>
      <a href="${url}" style="color: #1a3a6b; word-break: break-all;">${url}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #d0ddef; margin: 24px 0;">
    <p style="color: #8a9bb0; font-size: 12px; text-align: center;">
      Deze uitnodiging is 7 dagen geldig. Als je dit niet verwachtte, kun je deze mail negeren.
    </p>
  </div>
</body>
</html>`;

  const paymentText = params.paymentUrl ? `\n\n💰 Inleg betalen: ${params.paymentUrl}` : "";
  const text = `Je bent uitgenodigd voor de Vriendjes WK poule 2026!\n\n${params.invitedByName} heeft je uitgenodigd.\n\nMaak je account aan en begin direct met voorspellen. Heel veel weinig succes!\n\nAccount aanmaken: ${url}${paymentText}\n\nDeze uitnodiging is 7 dagen geldig.`;

  return { html, text, subject: "Je bent uitgenodigd voor de Vriendjes WK poule 2026!" };
}
