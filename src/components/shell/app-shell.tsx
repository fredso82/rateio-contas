import Link from "next/link";
import { ArrowUpRight, Sparkles, UserRound, UsersRound } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

type AppShellProps = {
  userName: string;
  userEmail: string;
  children: React.ReactNode;
};

export function AppShell({ userName, userEmail, children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-4 sm:px-6">
      <header className="glass-card flex items-center justify-between rounded-[2rem] border px-5 py-4">
        <div>
          <Link className="inline-flex items-center gap-3" href="/app/duplas">
            <div className="flex size-11 items-center justify-center rounded-[1.2rem] bg-foreground text-background">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="font-display text-2xl leading-none">Rateio</p>
              <p className="text-sm text-muted">
                {userName} · {userEmail}
              </p>
            </div>
          </Link>
        </div>
        <LogoutButton />
      </header>

      <main className="flex-1 py-6">{children}</main>

      <nav className="glass-card sticky bottom-4 mt-auto flex items-center justify-between rounded-[2rem] border px-4 py-3">
        <Link
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
          href="/app/duplas"
        >
          <UsersRound className="size-4" />
          Duplas
        </Link>
        <Link
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-white/70 hover:text-foreground"
          href="/app/perfil"
        >
          <UserRound className="size-4" />
          Perfil
        </Link>
        <Link
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-white/70 hover:text-foreground"
          href="/"
        >
          Voltar ao site
          <ArrowUpRight className="size-4" />
        </Link>
      </nav>
    </div>
  );
}
