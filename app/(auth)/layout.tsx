import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inloggen",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-12">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground">
          ⚽
        </div>
        <h1 className="text-2xl font-bold tracking-tight">WK Poule 2026</h1>
        <p className="text-sm text-muted-foreground">FIFA World Cup — VS / Canada / Mexico</p>
      </div>
      {children}
    </div>
  );
}
