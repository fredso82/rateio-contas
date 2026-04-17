import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getProfileSnapshot } from "@/server/profile/repository";

type CompleteProfileLayoutProps = {
  children: React.ReactNode;
};

export default async function CompleteProfileLayout({
  children,
}: CompleteProfileLayoutProps) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/entrar?callbackUrl=%2Fapp");
  }

  const profile = await getProfileSnapshot(session.user.id);

  if (!profile.isProfileComplete) {
    redirect("/app/perfil");
  }

  return children;
}
