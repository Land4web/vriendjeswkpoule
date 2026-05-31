export function formatMatchTime(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  return date.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Amsterdam",
  });
}

export function formatMatchDate(scheduledAt: string): string {
  const date = new Date(scheduledAt);
  return date.toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Amsterdam",
  });
}

export function isMatchLocked(scheduledAt: string, status: string): boolean {
  if (status === "FINISHED" || status === "IN_PLAY" || status === "PAUSED") return true;
  return new Date(scheduledAt) <= new Date();
}

export function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    GROUP: "Groepsfase",
    LAST_32: "Ronde van 32",
    LAST_16: "Achtste finales",
    QUARTER_FINALS: "Kwartfinales",
    SEMI_FINALS: "Halve finales",
    THIRD_PLACE: "Derde-plaatswedstrijd",
    FINAL: "Finale",
  };
  return labels[stage] ?? stage;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    SCHEDULED: "Gepland",
    TIMED: "Gepland",
    IN_PLAY: "Live",
    PAUSED: "Rust",
    FINISHED: "Afgelopen",
    POSTPONED: "Uitgesteld",
    CANCELLED: "Geannuleerd",
    SUSPENDED: "Gestaakt",
  };
  return labels[status] ?? status;
}
