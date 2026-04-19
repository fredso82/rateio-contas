import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AppShell } from "@/components/shell/app-shell";

type AppLayoutProps = {
  children: React.ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/entrar?callbackUrl=%2Fapp");
  }

  return (
    <AppShell
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? "Conta"}
    >
      {children}
    </AppShell>
  );
}
