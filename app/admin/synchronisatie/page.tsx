import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SyncButtons from "./sync-buttons";

export const metadata = { title: "Beheer — Synchronisatie" };

export default async function SynchronisatiePage() {
  const supabase = await createServiceClient();

  const { data: logs } = await supabase
    .from("sync_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(30);

  const statusVariant = (status: string) =>
    status === "success" ? "default" : status === "running" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Synchronisatie</h1>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Handmatige synchronisatie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SyncButtons />
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">Score handmatig corrigeren:</p>
            <Link
              href="/admin/synchronisatie/correctie"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Score correctie
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Sync-logboek</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {(logs ?? []).length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Nog geen synchronisaties uitgevoerd.</p>
          ) : (
            <div className="divide-y">
              {(logs ?? []).map((log) => (
                <div key={log.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{log.sync_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.started_at).toLocaleString("nl-NL")}
                      {log.records_processed > 0 && ` — ${log.records_processed} records`}
                    </p>
                    {log.error_message && (
                      <p className="text-xs text-destructive mt-0.5 truncate">{log.error_message}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant(log.status) as "default" | "secondary" | "destructive" | "outline"}>
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
