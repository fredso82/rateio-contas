"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="glass-card w-full max-w-lg rounded-[2rem] border p-8">
        <p className="eyebrow text-xs font-semibold text-muted">
          Algo saiu do trilho
        </p>
        <h1 className="font-display mt-4 text-4xl leading-none">
          A base do app está pronta para se recuperar.
        </h1>
        <p className="mt-4 text-base text-muted">
          {error.message ||
            "Ocorreu um erro inesperado. Você pode tentar novamente sem perder a sessão."}
        </p>
        <Button className="mt-8" onClick={reset}>
          <RotateCcw className="size-4" />
          Tentar de novo
        </Button>
      </div>
    </div>
  );
}
