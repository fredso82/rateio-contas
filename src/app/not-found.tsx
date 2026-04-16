import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="glass-card w-full max-w-lg rounded-[2rem] border p-8 text-center">
        <p className="eyebrow text-xs font-semibold text-muted">404</p>
        <h1 className="font-display mt-4 text-4xl leading-none">
          Essa rota ainda não entrou no nosso mapa.
        </h1>
        <p className="mt-4 text-base text-muted">
          A página que você tentou abrir não existe ou ainda não foi liberada
          neste MVP.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Voltar para a home</Link>
        </Button>
      </div>
    </div>
  );
}
