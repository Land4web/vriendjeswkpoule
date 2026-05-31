import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { syncMatches } from "@/lib/sync/sync-matches";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== process.env.SYNC_SECRET) {
    return NextResponse.json({ error: "Onbevoegd" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const { data: log } = await supabase
    .from("sync_logs")
    .insert({ sync_type: "matches", status: "running" })
    .select("id")
    .single();

  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "api_competition_id")
      .single();

    const competitionId = (settings?.value as { value: string } | null)?.value ?? "2000";
    const { processed } = await syncMatches(competitionId);

    await supabase
      .from("sync_logs")
      .update({ status: "success", records_processed: processed, finished_at: new Date().toISOString() })
      .eq("id", log?.id ?? "");

    return NextResponse.json({ success: true, processed });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("sync_logs")
      .update({ status: "error", error_message: message, finished_at: new Date().toISOString() })
      .eq("id", log?.id ?? "");

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
