"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm">
        <h2 className="text-lg font-semibold">Er is iets misgegaan</h2>
        <p className="text-sm text-muted-foreground">
          Er is een onverwachte fout opgetreden in het beheerpaneel.
        </p>
        <Button onClick={reset} variant="outline">
          Opnieuw proberen
        </Button>
      </div>
    </div>
  );
}
