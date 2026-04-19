"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, ArrowUpRight, UserRound, UsersRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/app/duplas/arquivadas",
    label: "Arquivadas",
    icon: Archive,
    match: (pathname: string) => pathname.startsWith("/app/duplas/arquivadas"),
  },
  {
    href: "/app/duplas",
    label: "Duplas",
    icon: UsersRound,
    match: (pathname: string) =>
      pathname === "/app/duplas" ||
      (pathname.startsWith("/app/duplas/") &&
        !pathname.startsWith("/app/duplas/arquivadas")),
  },
  {
    href: "/app/perfil",
    label: "Perfil",
    icon: UserRound,
    match: (pathname: string) => pathname === "/app/perfil",
  },
];

export function AppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass-card sticky bottom-4 mt-auto flex items-center justify-between gap-2 rounded-[2rem] border px-3 py-3">
      <div className="flex flex-1 items-center gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match(pathname);

          return (
            <Link
              key={item.href}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted hover:bg-white/70 hover:text-foreground",
              )}
              href={item.href}
            >
              <Icon className="size-4" />
              <span className="hidden min-[440px]:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <Link
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:bg-white/70 hover:text-foreground"
        href="/"
      >
        <span className="hidden sm:inline">Site</span>
        <ArrowUpRight className="size-4" />
      </Link>
    </nav>
  );
}
