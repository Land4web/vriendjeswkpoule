"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { updateProfile, changePassword } from "./actions";

// Tijdelijke client-side aanpak; profiel-data via parent layout beschikbaar
export default function ProfielPage() {
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProfileLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);
    setProfileLoading(false);
    if (result?.error) toast.error(result.error);
    else toast.success("Profiel bijgewerkt!");
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await changePassword(formData);
    setPasswordLoading(false);
    if (result?.error) toast.error(result.error);
    else {
      toast.success("Wachtwoord gewijzigd!");
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Mijn profiel</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Naam aanpassen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Volledige naam</Label>
              <Input id="full_name" name="full_name" required />
            </div>
            <Button type="submit" disabled={profileLoading}>
              {profileLoading ? "Opslaan…" : "Opslaan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Wachtwoord wijzigen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nieuw wachtwoord</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Bevestigen</Label>
              <Input id="confirm" name="confirm" type="password" minLength={8} required />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? "Wijzigen…" : "Wachtwoord wijzigen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
