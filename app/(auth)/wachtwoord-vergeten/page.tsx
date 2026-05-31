"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function WachtwoordVergetenPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/wachtwoord-reset`,
    });

    if (error) {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <Card className="w-full max-w-sm shadow-lg">
        <CardContent className="pt-6 text-center space-y-3">
          <p className="text-3xl">📧</p>
          <h2 className="font-semibold text-lg">E-mail verstuurd</h2>
          <p className="text-sm text-muted-foreground">
            Als dit e-mailadres bekend is, ontvang je een link om je wachtwoord te resetten.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Wachtwoord vergeten</CardTitle>
        <CardDescription>
          Vul je e-mailadres in en we sturen je een reset-link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mailadres</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jij@voorbeeld.nl"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Versturen…" : "Reset-link versturen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
