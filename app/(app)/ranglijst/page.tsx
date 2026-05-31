import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Ranglijst" };

export default async function RanglijstPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: standings } = await supabase
    .from("standings")
    .select("*, user_id")
    .order("total_points", { ascending: false })
    .order("correct_exact", { ascending: false });

  const userIds = (standings ?? []).map((s) => s.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, full_name")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Ranglijst</h1>

      {(standings ?? []).length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            <p>Nog geen scores — de ranglijst verschijnt zodra de eerste wedstrijd afgelopen is.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {(standings ?? []).map((standing, index) => {
                const profile = profileMap.get(standing.user_id);
                const isMe = standing.user_id === user.id;
                const rankChange = standing.previous_rank
                  ? standing.previous_rank - (standing.rank ?? index + 1)
                  : 0;

                return (
                  <div
                    key={standing.id}
                    className={`flex items-center gap-3 px-4 py-3 ${isMe ? "bg-primary/5" : ""}`}
                  >
                    {/* Positie */}
                    <div className="w-8 text-center shrink-0">
                      {index === 0 ? (
                        <span className="text-xl">🥇</span>
                      ) : index === 1 ? (
                        <span className="text-xl">🥈</span>
                      ) : index === 2 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                      )}
                    </div>

                    {/* Naam */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isMe ? "text-primary" : ""}`}>
                        {profile?.full_name ?? "Onbekend"}
                        {isMe && <span className="ml-1 text-xs">(jij)</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="hidden sm:flex gap-2 text-xs text-muted-foreground">
                        <span title="Exacte uitslagen">{standing.correct_exact}× exact</span>
                        <span>•</span>
                        <span title="Juiste winnaar">{standing.correct_winner}× winnaar</span>
                      </div>

                      {/* Positieverandering */}
                      {rankChange !== 0 && (
                        <span className={`text-xs font-medium ${rankChange > 0 ? "text-green-500" : "text-red-500"}`}>
                          {rankChange > 0 ? `▲${rankChange}` : `▼${Math.abs(rankChange)}`}
                        </span>
                      )}

                      {/* Punten */}
                      <Badge variant={isMe ? "default" : "secondary"} className="tabular-nums">
                        {standing.total_points} pt
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
