"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            <WifiOff className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sin conexión</h1>
          <p className="text-muted-foreground max-w-md">
            Parece que no tienes conexión a internet. Algunas funciones pueden no estar disponibles.
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar conexión
          </Button>

          <p className="text-sm text-muted-foreground">
            Las tareas que hayas creado offline se sincronizarán cuando vuelvas a conectarte.
          </p>
        </div>
      </div>
    </div>
  );
}
