import { createClient } from "@/lib/supabase/server";
import WedstrijdenView from "./wedstrijden-view";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wedstrijden" };

export default async function WedstrijdenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: matches } = await supabase
    .from("matches")
    .select("id, scheduled_at, stage, group_name, status, home_team_id, away_team_id, home_score, away_score")
    .order("scheduled_at", { ascending: true });

  const teamIds = [...new Set(
    (matches?.flatMap((m) => [m.home_team_id, m.away_team_id]) ?? []).filter(Boolean) as string[]
  )];

  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, short_name, flag_url")
    .in("id", teamIds.length > 0 ? teamIds : ["00000000-0000-0000-0000-000000000000"]);

  const teamsMap = Object.fromEntries((teamsData ?? []).map((t) => [t.id, t]));

  const matchIds = (matches ?? []).map((m) => m.id);
  const { data: myPredictions } = await supabase
    .from("predictions")
    .select("match_id, home_score, away_score, points_awarded")
    .eq("user_id", user.id)
    .in("match_id", matchIds.length > 0 ? matchIds : ["00000000-0000-0000-0000-000000000000"]);

  const predMap = Object.fromEntries((myPredictions ?? []).map((p) => [p.match_id, p]));

  const groups = [...new Set(
    (matches ?? []).filter((m) => m.stage === "GROUP").map((m) => m.group_name).filter(Boolean) as string[]
  )].sort();

  return (
    <div className="space-y-5 bg-primary rounded-2xl p-5 -mx-4 sm:-mx-6">
      <h1 className="text-2xl font-bold text-white">Wedstrijden</h1>
      <WedstrijdenView
        matches={matches ?? []}
        teamsMap={teamsMap}
        predMap={predMap}
        groups={groups}
      />
    </div>
  );
}
