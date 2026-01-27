"use client";

import dynamic from "next/dynamic";

// Load PWA components only on client-side to avoid SSR issues
const OfflineIndicator = dynamic(
  () => import("./offline-indicator").then((mod) => mod.OfflineIndicator),
  { ssr: false }
);

const InstallPrompt = dynamic(
  () => import("./install-prompt").then((mod) => mod.InstallPrompt),
  { ssr: false }
);

export function PWAProvider() {
  return (
    <>
      <OfflineIndicator />
      <InstallPrompt />
    </>
  );
}
