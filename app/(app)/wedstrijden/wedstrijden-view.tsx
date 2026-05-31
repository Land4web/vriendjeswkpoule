"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatMatchTime, getStageLabel, isMatchLocked } from "@/lib/utils/match";
import { cn } from "@/lib/utils";

interface Team { id: string; name: string; short_name: string; flag_url: string | null }
interface Match {
  id: string;
  scheduled_at: string;
  stage: string;
  group_name: string | null;
  status: string;
  home_team_id: string | null;
  away_team_id: string | null;
  home_score: number | null;
  away_score: number | null;
}
interface Prediction { match_id: string; home_score: number; away_score: number; points_awarded: number | null }

interface Props {
  matches: Match[];
  teamsMap: Record<string, Team>;
  predMap: Record<string, Prediction>;
  groups: string[];
}

function MatchCard({ match, team1, team2, pred }: {
  match: Match;
  team1: Team | null;
  team2: Team | null;
  pred: Prediction | undefined;
}) {
  const locked = isMatchLocked(match.scheduled_at, match.status);
  const isFinished = match.status === "FINISHED";
  const isLive = match.status === "IN_PLAY" || match.status === "PAUSED";

  return (
    <Link href={`/wedstrijden/${match.id}`}>
      <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/10 p-4 hover:bg-white/15 transition-colors">
        {/* Thuis */}
        <div className="flex-1 flex items-center justify-end gap-2 min-w-0">
          <span className="text-sm font-semibold truncate text-right text-white">{team1?.name ?? "?"}</span>
          {team1?.flag_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team1.flag_url} alt="" className="h-5 w-7 object-cover rounded-sm shrink-0" />
          )}
        </div>

        {/* Score / tijd */}
        <div className="flex flex-col items-center shrink-0 w-20">
          {isFinished || isLive ? (
            <>
              <span className={cn("text-lg font-bold tabular-nums", isLive ? "text-yellow-300" : "text-white")}>
                {match.home_score ?? 0} – {match.away_score ?? 0}
              </span>
              {isLive && <span className="text-xs text-yellow-300 font-medium">LIVE</span>}
            </>
          ) : (
            <>
              <span className="text-sm font-semibold text-white/80">
                {new Date(match.scheduled_at).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" })}
              </span>
              <span className="text-xs text-white/60">
                {new Date(match.scheduled_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", timeZone: "Europe/Amsterdam" })}
              </span>
            </>
          )}
          {match.status === "POSTPONED" && <span className="text-xs text-muted-foreground">Uitgesteld</span>}
        </div>

        {/* Uit */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          {team2?.flag_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team2.flag_url} alt="" className="h-5 w-7 object-cover rounded-sm shrink-0" />
          )}
          <span className="text-sm font-semibold truncate text-white">{team2?.name ?? "?"}</span>
        </div>

        {/* Voorspelling */}
        <div className="shrink-0">
          {pred ? (
            <Badge variant={isFinished && pred.points_awarded !== null ? "default" : "secondary"} className="text-xs tabular-nums">
              {pred.home_score}–{pred.away_score}
              {isFinished && pred.points_awarded !== null && ` · ${pred.points_awarded}pt`}
            </Badge>
          ) : !locked ? (
            <Badge variant="outline" className="text-xs text-muted-foreground">Invullen</Badge>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

export default function WedstrijdenView({ matches, teamsMap, predMap, groups }: Props) {
  const [selected, setSelected] = useState<string>(groups[0] ? `groep-${groups[0]}` : "knockout");

  const groupMatches = matches.filter((m) => m.stage === "GROUP");
  const koMatches = matches.filter((m) => m.stage !== "GROUP");

  const groupLabel = (g: string) => `Groep ${g.replace("GROUP_", "")}`;

  const buttons = [
    ...groups.map((g) => ({ key: `groep-${g}`, label: groupLabel(g) })),
    { key: "knockout", label: "Knock-out" },
  ];

  return (
    <div className="space-y-5">
      {/* Groepsselectie */}
      <div className="flex flex-wrap gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.key}
            onClick={() => setSelected(btn.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
              selected === btn.key
                ? "bg-primary text-white border-primary"
                : "bg-primary/80 text-white border-primary/60 hover:bg-primary"
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Wedstrijden */}
      {selected === "knockout" ? (
        <div className="space-y-6">
          {["LAST_32", "LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "THIRD_PLACE", "FINAL"].map((stage) => {
            const stageMatches = koMatches.filter((m) => m.stage === stage);
            if (stageMatches.length === 0) return null;
            return (
              <div key={stage}>
                <h2 className="text-sm font-semibold text-white/70 mb-3">{getStageLabel(stage)}</h2>
                <div className="space-y-3">
                  {stageMatches.map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      team1={m.home_team_id ? teamsMap[m.home_team_id] ?? null : null}
                      team2={m.away_team_id ? teamsMap[m.away_team_id] ?? null : null}
                      pred={predMap[m.id]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {koMatches.length === 0 && (
            <p className="text-sm text-muted-foreground">Knock-out schema volgt zodra de groepsfase afgerond is.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {groupMatches
            .filter((m) => `groep-${m.group_name}` === selected)
            .map((m) => (
              <MatchCard
                key={m.id}
                match={m}
                team1={m.home_team_id ? teamsMap[m.home_team_id] ?? null : null}
                team2={m.away_team_id ? teamsMap[m.away_team_id] ?? null : null}
                pred={predMap[m.id]}
              />
            ))}
        </div>
      )}
    </div>
  );
}
