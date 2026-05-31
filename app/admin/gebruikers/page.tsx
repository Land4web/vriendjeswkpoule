import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import GebruikerActions from "./gebruiker-actions";

export const metadata = { title: "Beheer — Gebruikers" };

export default async function GebruikersPage() {
  const supabase = await createServiceClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name, role, is_active, created_at")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Gebruikers</h1>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {(profiles ?? []).map((profile) => (
              <div key={profile.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{profile.username}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
                    {profile.role}
                  </Badge>
                  {!profile.is_active && (
                    <Badge variant="destructive">inactief</Badge>
                  )}
                  <GebruikerActions profileId={profile.id} isActive={profile.is_active} role={profile.role} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
