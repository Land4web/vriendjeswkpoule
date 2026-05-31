import { createServiceClient } from "@/lib/supabase/server";
import CorrectieForm from "./correctie-form";

export const metadata = { title: "Beheer — Score Correctie" };

export default async function CorrectiePage() {
  const supabase = await createServiceClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, scheduled_at, status, home_score, away_score, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name)")
    .order("scheduled_at", { ascending: true })
    .limit(200);

  const matchOptions = (matches ?? []).map((m) => ({
    id: m.id,
    label: `${(m.home_team as { name: string } | null)?.name ?? "?"} – ${(m.away_team as { name: string } | null)?.name ?? "?"} (${new Date(m.scheduled_at).toLocaleDateString("nl-NL")})`,
    homeScore: m.home_score,
    awayScore: m.away_score,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Score Correctie</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pas een uitslag handmatig aan. De puntentelling wordt automatisch opnieuw berekend.
        </p>
      </div>

      <CorrectieForm matches={matchOptions} />
    </div>
  );
}
