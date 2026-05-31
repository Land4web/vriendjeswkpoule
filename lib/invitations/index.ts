import { randomBytes } from "crypto";

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function getExpiresAt(days = 7): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}
