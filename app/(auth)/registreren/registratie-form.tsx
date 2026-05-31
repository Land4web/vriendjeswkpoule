"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { register } from "./actions";

interface Props {
  email: string;
  token: string;
}

export default function RegistratieForm({ email, token }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("token", token);
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">Account aanmaken</CardTitle>
        <CardDescription>
          Je bent uitgenodigd via <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <div className="space-y-2">
            <Label htmlFor="username">Gebruikersnaam</Label>
            <Input
              id="username"
              name="username"
              placeholder="jouwNaam"
              minLength={3}
              maxLength={30}
              pattern="[a-zA-Z0-9_-]+"
              title="Alleen letters, cijfers, _ en -"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="first_name">Voornaam</Label>
              <Input
                id="first_name"
                name="first_name"
                placeholder="Maarten"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Achternaam</Label>
              <Input
                id="last_name"
                name="last_name"
                placeholder="Land"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Wachtwoord</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              placeholder="Minimaal 8 tekens"
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

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Account aanmaken…" : "Account aanmaken"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
