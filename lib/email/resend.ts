import { Resend } from "resend";

export const FROM_EMAIL = "WK Poule 2026 <noreply@wkpoule.nl>";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Lazy instantiatie — Resend vereist een geldige API key bij constructie
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is niet ingesteld in .env.local");
    }
    _resend = new Resend(key);
  }
  return _resend;
}
