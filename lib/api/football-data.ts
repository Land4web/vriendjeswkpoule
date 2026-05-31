const BASE_URL = "https://api.football-data.org/v4";

function getHeaders() {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) throw new Error("FOOTBALL_DATA_API_KEY is niet ingesteld");
  return { "X-Auth-Token": key };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: getHeaders(),
    next: { revalidate: 0 },
  });

  if (res.status === 429) {
    // Rate limit — wacht 60 seconden
    await new Promise((r) => setTimeout(r, 60_000));
    return apiFetch(path);
  }

  if (!res.ok) {
    throw new Error(`football-data.org API fout: ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json() as Promise<T>;
}

// Typen voor football-data.org responses
export interface FDTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FDMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string } | null;
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string } | null;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
  venue: string | null;
}

export interface FDScorer {
  player: { id: number; name: string };
  team: { id: number; name: string };
  goals: number;
  assists: number | null;
}

// API functies
export async function fetchTeams(competitionId = "2000"): Promise<FDTeam[]> {
  const data = await apiFetch<{ teams: FDTeam[] }>(`/competitions/${competitionId}/teams`);
  return data.teams;
}

export async function fetchMatches(competitionId = "2000"): Promise<FDMatch[]> {
  const data = await apiFetch<{ matches: FDMatch[] }>(`/competitions/${competitionId}/matches`);
  return data.matches;
}

export async function fetchLiveAndRecentMatches(competitionId = "2000"): Promise<FDMatch[]> {
  // Haal wedstrijden op met status IN_PLAY, PAUSED of FINISHED van vandaag
  const today = new Date().toISOString().split("T")[0];
  const data = await apiFetch<{ matches: FDMatch[] }>(
    `/competitions/${competitionId}/matches?dateFrom=${today}&dateTo=${today}`
  );
  return data.matches;
}

export async function fetchScorers(competitionId = "2000"): Promise<FDScorer[]> {
  const data = await apiFetch<{ scorers: FDScorer[] }>(
    `/competitions/${competitionId}/scorers?limit=20`
  );
  return data.scorers;
}

// Mapping van football-data.org stage-namen naar onze DB-waarden
export function mapStage(fdStage: string): string {
  const stageMap: Record<string, string> = {
    GROUP_STAGE: "GROUP",
    ROUND_OF_32: "LAST_32",
    ROUND_OF_16: "LAST_16",
    QUARTER_FINALS: "QUARTER_FINALS",
    SEMI_FINALS: "SEMI_FINALS",
    THIRD_PLACE: "THIRD_PLACE",
    FINAL: "FINAL",
  };
  return stageMap[fdStage] ?? fdStage;
}
