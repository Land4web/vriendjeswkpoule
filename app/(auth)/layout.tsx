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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="De vriendjes WK poule 2026" className="h-28 w-auto drop-shadow-lg" />
          <p className="text-sm text-white/70">FIFA World Cup — VS / Canada / Mexico</p>
        </div>

        {children}
      </div>
    </div>
  );
}
