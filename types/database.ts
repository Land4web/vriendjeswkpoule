export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          role: "player" | "admin";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          role?: "player" | "admin";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          role?: "player" | "admin";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          token: string;
          invited_by: string | null;
          used_at: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          token: string;
          invited_by?: string | null;
          used_at?: string | null;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          token?: string;
          invited_by?: string | null;
          used_at?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          external_id: string;
          name: string;
          short_name: string;
          tla: string | null;
          flag_url: string | null;
          group_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          name: string;
          short_name: string;
          tla?: string | null;
          flag_url?: string | null;
          group_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          name?: string;
          short_name?: string;
          tla?: string | null;
          flag_url?: string | null;
          group_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          external_id: string;
          home_team_id: string | null;
          away_team_id: string | null;
          scheduled_at: string;
          stage: string;
          group_name: string | null;
          matchday: number | null;
          status: string;
          home_score: number | null;
          away_score: number | null;
          score_processed: boolean;
          venue: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          home_team_id?: string | null;
          away_team_id?: string | null;
          scheduled_at: string;
          stage: string;
          group_name?: string | null;
          matchday?: number | null;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          score_processed?: boolean;
          venue?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          home_team_id?: string | null;
          away_team_id?: string | null;
          scheduled_at?: string;
          stage?: string;
          group_name?: string | null;
          matchday?: number | null;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          score_processed?: boolean;
          venue?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matches_home_team_id_fkey";
            columns: ["home_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matches_away_team_id_fkey";
            columns: ["away_team_id"];
            isOneToOne: false;
            referencedRelation: "teams";
            referencedColumns: ["id"];
          }
        ];
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          points_awarded: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          home_score: number;
          away_score: number;
          points_awarded?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string;
          home_score?: number;
          away_score?: number;
          points_awarded?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      scorers: {
        Row: {
          id: string;
          external_id: string;
          name: string;
          team_id: string | null;
          goals: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          name: string;
          team_id?: string | null;
          goals?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          name?: string;
          team_id?: string | null;
          goals?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      tournament_predictions: {
        Row: {
          id: string;
          user_id: string;
          champion_team_id: string | null;
          runner_up_team_id: string | null;
          third_place_team_id: string | null;
          top_scorer_id: string | null;
          champion_points: number | null;
          runner_up_points: number | null;
          third_place_points: number | null;
          top_scorer_points: number | null;
          locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          champion_team_id?: string | null;
          runner_up_team_id?: string | null;
          third_place_team_id?: string | null;
          top_scorer_id?: string | null;
          champion_points?: number | null;
          runner_up_points?: number | null;
          third_place_points?: number | null;
          top_scorer_points?: number | null;
          locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          champion_team_id?: string | null;
          runner_up_team_id?: string | null;
          third_place_team_id?: string | null;
          top_scorer_id?: string | null;
          champion_points?: number | null;
          runner_up_points?: number | null;
          third_place_points?: number | null;
          top_scorer_points?: number | null;
          locked?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      standings: {
        Row: {
          id: string;
          user_id: string;
          total_points: number;
          match_points: number;
          tournament_points: number;
          correct_exact: number;
          correct_winner: number;
          predictions_made: number;
          rank: number | null;
          previous_rank: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_points?: number;
          match_points?: number;
          tournament_points?: number;
          correct_exact?: number;
          correct_winner?: number;
          predictions_made?: number;
          rank?: number | null;
          previous_rank?: number | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_points?: number;
          match_points?: number;
          tournament_points?: number;
          correct_exact?: number;
          correct_winner?: number;
          predictions_made?: number;
          rank?: number | null;
          previous_rank?: number | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      points_history: {
        Row: {
          id: string;
          user_id: string;
          match_id: string | null;
          prediction_id: string | null;
          tournament_prediction_id: string | null;
          points: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id?: string | null;
          prediction_id?: string | null;
          tournament_prediction_id?: string | null;
          points: number;
          reason: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          match_id?: string | null;
          prediction_id?: string | null;
          tournament_prediction_id?: string | null;
          points?: number;
          reason?: string;
        };
        Relationships: [];
      };
      sync_logs: {
        Row: {
          id: string;
          sync_type: string;
          status: string;
          records_processed: number;
          error_message: string | null;
          started_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          sync_type: string;
          status: string;
          records_processed?: number;
          error_message?: string | null;
          started_at?: string;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          sync_type?: string;
          status?: string;
          records_processed?: number;
          error_message?: string | null;
          finished_at?: string | null;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          updated_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          updated_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
