"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createInvitation } from "./actions";

export default function UitnodigingForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.set("email", email);
    const result = await createInvitation(formData);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Uitnodiging verstuurd naar ${email}`);
      setEmail("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <div className="flex-1">
        <Label htmlFor="email" className="sr-only">E-mailadres</Label>
        <Input
          id="email"
          type="email"
          placeholder="naam@voorbeeld.nl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Versturen…" : "Uitnodiging sturen"}
      </Button>
    </form>
  );
}
