import { createServiceClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InstellingenForm from "./instellingen-form";

export const metadata = { title: "Beheer — Instellingen" };

export default async function InstellingenPage() {
  const supabase = await createServiceClient();
  const { data: settings } = await supabase.from("settings").select("key, value");

  const settingsMap = Object.fromEntries(
    (settings ?? []).map((s) => [s.key, (s.value as { value: string | number }).value])
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Instellingen</h1>
      <InstellingenForm settings={settingsMap} />
    </div>
  );
}
