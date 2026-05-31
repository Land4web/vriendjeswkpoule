"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function WachtwoordResetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (password !== passwordConfirm) {
      setError("Wachtwoorden komen niet overeen.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Wachtwoord moet minimaal 8 tekens zijn.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError("Wachtwoord instellen mislukt. Probeer het opnieuw.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Nieuw wachtwoord instellen</CardTitle>
        <CardDescription>Kies een sterk wachtwoord van minimaal 8 tekens.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Nieuw wachtwoord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirm">Wachtwoord bevestigen</Label>
            <Input
              id="password_confirm"
              name="password_confirm"
              type="password"
              minLength={8}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Opslaan…" : "Wachtwoord opslaan"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
