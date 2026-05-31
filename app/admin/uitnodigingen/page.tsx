import { createClient, createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UitnodigingForm from "./uitnodiging-form";

export const metadata = { title: "Beheer — Uitnodigingen" };

export default async function UitnodigingenPage() {
  const supabase = await createServiceClient();

  const { data: invitations } = await supabase
    .from("invitations")
    .select("id, email, used_at, expires_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Uitnodigingen</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Nieuwe uitnodiging sturen</CardTitle>
        </CardHeader>
        <CardContent>
          <UitnodigingForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Geschiedenis</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(invitations ?? []).length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Nog geen uitnodigingen verstuurd.</p>
          ) : (
            <div className="divide-y">
              {(invitations ?? []).map((inv) => {
                const isExpired = new Date(inv.expires_at) <= new Date();
                const isUsed = !!inv.used_at;
                return (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString("nl-NL")}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isUsed ? (
                        <Badge variant="secondary">Gebruikt</Badge>
                      ) : isExpired ? (
                        <Badge variant="outline" className="text-muted-foreground">Verlopen</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">Open</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
