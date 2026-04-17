"use client";

import type { ReactNode } from "react";

import { PwaRegistration } from "@/components/pwa/pwa-registration";
import { Toaster } from "@/components/ui/toaster";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <>
      {children}
      <PwaRegistration />
      <Toaster />
    </>
  );
}
