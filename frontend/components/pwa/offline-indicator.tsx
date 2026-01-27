"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-bottom-2">
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">Sin conexión</span>
    </div>
  );
}
