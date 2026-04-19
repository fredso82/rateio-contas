import Link from "next/link";
import { Sparkles } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { AppBottomNav } from "@/components/shell/app-bottom-nav";

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
          <Link className="inline-flex items-center gap-3" href="/app">
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

      <main className="page-reveal flex-1 py-6">{children}</main>

      <AppBottomNav />
    </div>
  );
}
