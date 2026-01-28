"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);

      // Check if user has dismissed before
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm bg-card border rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-2">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Download className="h-5 w-5 text-primary" />
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Instalar aplicación</h3>
          <p className="text-sm text-muted-foreground">
            Instala Gestor de Tareas en tu dispositivo para acceso rápido y uso offline.
          </p>

          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleInstall}>
              Instalar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Ahora no
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
