import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/gebruikers", label: "Gebruikers" },
  { href: "/admin/uitnodigingen", label: "Uitnodigingen" },
  { href: "/admin/instellingen", label: "Instellingen" },
  { href: "/admin/synchronisatie", label: "Synchronisatie" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto max-w-6xl px-4 flex h-14 items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold shrink-0">
            <span>⚽</span>
            <span className="hidden sm:block text-sm">WK Poule 2026</span>
          </Link>
          <span className="text-muted-foreground text-sm hidden sm:block">/</span>
          <span className="text-sm font-medium hidden sm:block">Beheer</span>
          <div className="ml-auto">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Terug naar app
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-6 flex gap-6">
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
