import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getUserPrimaryWorkspace } from "@/server/navigation/repository";

export default async function AppIndexPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const workspace = await getUserPrimaryWorkspace(session.user.id);

  redirect(workspace.path);
}
