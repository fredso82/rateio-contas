"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "rounded-[1.5rem] border border-line bg-white/95 text-foreground shadow-[0_18px_50px_rgba(31,26,22,0.18)]",
          title: "text-sm font-semibold",
          description: "text-sm text-muted",
        },
      }}
    />
  );
}
