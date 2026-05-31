"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { logout } from "@/app/(auth)/login/actions";
import { cn } from "@/lib/utils";

interface Profile {
  username: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wedstrijden", label: "Wedstrijden" },
  { href: "/toernooi", label: "Toernooi" },
  { href: "/ranglijst", label: "Ranglijst" },
];

export default function MainNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials = (profile?.full_name ?? "??")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-primary/20 bg-primary text-primary-foreground backdrop-blur">
      <div className="container mx-auto max-w-5xl px-4 flex h-14 items-center gap-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="De vriendjes WK poule 2026" className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm px-3 py-1.5 rounded-md transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-white/25 text-white font-medium"
                  : "text-white/70 hover:text-white hover:bg-white/15"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          {/* Mobile nav */}
          <Sheet>
            <SheetTrigger
              className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none"
              aria-label="Menu openen"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 pt-10">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-sm px-3 py-2 rounded-md transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                {isAdmin && (
                  <>
                    <div className="my-1 h-px bg-border" />
                    <Link
                      href="/admin"
                      className="text-sm px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      Beheer
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {/* User menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Gebruikersmenu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-10 z-50 w-48 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 py-1">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                </div>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => { setMenuOpen(false); router.push("/profiel"); }}
                >
                  Profiel
                </button>
                {isAdmin && (
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => { setMenuOpen(false); router.push("/admin"); }}
                  >
                    Beheer
                  </button>
                )}
                <div className="my-1 h-px bg-border" />
                <button
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={async () => { setMenuOpen(false); await logout(); }}
                >
                  Uitloggen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
