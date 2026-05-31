"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { toggleUserActive, toggleUserRole } from "./actions";

interface Props {
  profileId: string;
  isActive: boolean;
  role: string;
}

export default function GebruikerActions({ profileId, isActive, role }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none">
        <span className="sr-only">Acties</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="12" cy="19" r="1.5" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={async () => {
            const fd = new FormData();
            fd.set("profile_id", profileId);
            fd.set("is_active", String(!isActive));
            const result = await toggleUserActive(fd);
            if (result?.error) toast.error(result.error);
            else toast.success(isActive ? "Gebruiker gedeactiveerd" : "Gebruiker geactiveerd");
          }}
        >
          {isActive ? "Deactiveren" : "Activeren"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={async () => {
            const fd = new FormData();
            fd.set("profile_id", profileId);
            fd.set("role", role === "admin" ? "player" : "admin");
            const result = await toggleUserRole(fd);
            if (result?.error) toast.error(result.error);
            else toast.success(`Rol gewijzigd naar ${role === "admin" ? "player" : "admin"}`);
          }}
        >
          {role === "admin" ? "Maak speler" : "Maak admin"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
