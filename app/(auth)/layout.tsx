import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inloggen — Vriendjes WK Poule 2026",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Donker overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Inhoud */}
      <div className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 backdrop-blur text-4xl shadow-lg border border-white/20">
            ⚽
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Vriendjes WK Poule 2026</h1>
            <p className="text-sm text-white/70 mt-0.5">FIFA World Cup — VS / Canada / Mexico</p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
