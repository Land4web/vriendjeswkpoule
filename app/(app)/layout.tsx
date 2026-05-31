import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MainNav from "@/components/nav/MainNav";

export default async function AppLayout({
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
    .select("username, full_name, role, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav profile={profile} />
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
