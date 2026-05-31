"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { runManualSync } from "./sync-actions";

const SYNC_TYPES = [
  { key: "teams", label: "Teams" },
  { key: "matches", label: "Wedstrijden" },
  { key: "scores", label: "Uitslagen" },
  { key: "scorers", label: "Topscorers" },
] as const;

type SyncType = (typeof SYNC_TYPES)[number]["key"];

export default function SyncButtons() {
  const [loading, setLoading] = useState<SyncType | null>(null);

  async function runSync(type: SyncType) {
    setLoading(type);
    const result = await runManualSync(type);
    setLoading(null);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Sync ${type} voltooid — ${result.records ?? 0} records verwerkt`);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {SYNC_TYPES.map(({ key, label }) => (
        <Button
          key={key}
          variant="outline"
          size="sm"
          onClick={() => runSync(key)}
          disabled={loading !== null}
        >
          {loading === key ? "Bezig…" : `Sync ${label}`}
        </Button>
      ))}
    </div>
  );
}
