"use server";

import { createServiceClient } from "@/lib/supabase/server";
import { syncTeams } from "@/lib/sync/sync-teams";
import { syncMatches } from "@/lib/sync/sync-matches";
import { syncScores } from "@/lib/sync/sync-scores";
import { syncScorers } from "@/lib/sync/sync-scorers";

type SyncType = "teams" | "matches" | "scores" | "scorers";

export async function runManualSync(type: SyncType): Promise<{ records?: number; error?: string }> {
  const supabase = await createServiceClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Niet ingelogd" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Geen toegang" };

  const { data: log } = await (supabase as any)
    .from("sync_logs")
    .insert({ sync_type: type, status: "running" })
    .select()
    .single();

  try {
    let records = 0;

    if (type === "teams") {
      const result = await syncTeams();
      records = result.processed;
    } else if (type === "matches") {
      const result = await syncMatches();
      records = result.processed;
    } else if (type === "scores") {
      const result = await syncScores();
      records = result.processed;
    } else if (type === "scorers") {
      const result = await syncScorers();
      records = result.processed;
    }

    if (log?.id) {
      await (supabase as any)
        .from("sync_logs")
        .update({ status: "success", records_processed: records, finished_at: new Date().toISOString() })
        .eq("id", log.id);
    }

    return { records };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";

    if (log?.id) {
      await (supabase as any)
        .from("sync_logs")
        .update({ status: "error", error_message: message, finished_at: new Date().toISOString() })
        .eq("id", log.id);
    }

    return { error: message };
  }
}
