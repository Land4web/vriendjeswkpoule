import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Beheer — Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: predictionCount },
    { count: matchCount },
    { data: lastSync },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("predictions").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("sync_logs").select("sync_type, status, started_at").order("started_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const { count: totalPossiblePredictions } = await supabase
    .from("matches")
    .select("*", { count: "exact", head: true })
    .in("status", ["SCHEDULED", "TIMED", "FINISHED"]);

  const predPct = totalPossiblePredictions && userCount && totalPossiblePredictions > 0
    ? Math.round((predictionCount ?? 0) / ((userCount ?? 1) * totalPossiblePredictions) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Beheer — Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">{userCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Spelers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">{matchCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Wedstrijden</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">{predictionCount ?? 0}</p>
            <p className="text-sm text-muted-foreground">Voorspellingen</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-3xl font-bold">{predPct}%</p>
            <p className="text-sm text-muted-foreground">Invulling</p>
          </CardContent>
        </Card>
      </div>

      {lastSync && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Laatste synchronisatie</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Type: <strong>{lastSync.sync_type}</strong> — Status:{" "}
              <strong>{lastSync.status}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(lastSync.started_at).toLocaleString("nl-NL")}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
