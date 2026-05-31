import type { Database } from "./database";

// Handige type-afkortingen
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type Prediction = Database["public"]["Tables"]["predictions"]["Row"];
export type Scorer = Database["public"]["Tables"]["scorers"]["Row"];
export type TournamentPrediction = Database["public"]["Tables"]["tournament_predictions"]["Row"];
export type Standing = Database["public"]["Tables"]["standings"]["Row"];
export type PointsHistory = Database["public"]["Tables"]["points_history"]["Row"];
export type SyncLog = Database["public"]["Tables"]["sync_logs"]["Row"];
export type Setting = Database["public"]["Tables"]["settings"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];

// Match met team-info ingebonden
export type MatchWithTeams = Match & {
  home_team: Team | null;
  away_team: Team | null;
};

// Prediction met wedstrijd
export type PredictionWithMatch = Prediction & {
  match: MatchWithTeams;
};

// Standing met profiel
export type StandingWithProfile = Standing & {
  profile: Profile;
};

// Wedstrijdstatus
export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "CANCELLED"
  | "SUSPENDED";

// Toernooifase
export type MatchStage =
  | "GROUP"
  | "LAST_32"
  | "LAST_16"
  | "QUARTER_FINALS"
  | "SEMI_FINALS"
  | "THIRD_PLACE"
  | "FINAL";

// Puntensysteem uit settings
export interface PointsConfig {
  points_exact: number;
  points_winner: number;
  points_champion: number;
  points_runner_up: number;
  points_third_place: number;
  points_top_scorer: number;
  tournament_prediction_deadline: string;
  tournament_name: string;
}
