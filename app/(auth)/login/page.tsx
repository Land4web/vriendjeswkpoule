"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // Bij succes redirect door server action
  }

  return (
    <div className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-8">
      <h2 className="text-xl font-bold text-white mb-1">Inloggen</h2>
      <p className="text-sm text-white/60 mb-6">Voer je gegevens in om verder te gaan.</p>

      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/80">E-mailadres</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="jij@voorbeeld.nl"
            required
            autoComplete="email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/80">Wachtwoord</Label>
            <Link
              href="/wachtwoord-vergeten"
              className="text-xs text-white/50 hover:text-white transition-colors"
            >
              Vergeten?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
          />
        </div>

        {error && (
          <p className="text-sm text-red-300">{error}</p>
        )}

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Bezig met inloggen…" : "Inloggen"}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-white/40">
        Geen account?{" "}
        <span className="text-white/60 font-medium">Vraag de beheerder om een uitnodiging.</span>
      </p>
    </div>
  );
}
