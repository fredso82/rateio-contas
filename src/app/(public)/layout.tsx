import type { ReactNode } from "react";
import Link from "next/link";
import { HandCoins, Sparkles } from "lucide-react";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6">
      <header className="glass-card flex items-center justify-between rounded-[2rem] border px-5 py-4">
        <Link className="inline-flex items-center gap-3" href="/">
          <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-foreground text-background">
            <HandCoins className="size-5" />
          </div>
          <div>
            <p className="font-display text-2xl leading-none">Rateio Contas</p>
            <p className="text-sm text-muted">
              rotina compartilhada, sem planilha solta
            </p>
          </div>
        </Link>
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            className="rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-white/70 hover:text-foreground"
            href="/entrar"
          >
            Entrar
          </Link>
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:bg-brand"
            href="/cadastro"
          >
            <Sparkles className="size-4" />
            Criar conta
          </Link>
        </div>
      </header>
      <main className="flex-1 py-6">{children}</main>
    </div>
  );
}
