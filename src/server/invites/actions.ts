"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { assertRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-context";
import { acceptInvite } from "@/server/invites/repository";

function stringFromFormData(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function acceptPendingInvite(formData: FormData) {
  const token = stringFromFormData(formData.get("token"));

  if (!token) {
    redirect("/app");
  }

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/entrar?callbackUrl=${encodeURIComponent(`/convite/${token}`)}`);
  }

  const clientIp = await getClientIp();

  assertRateLimit({
    key: `invite:accept:${clientIp}:${session.user.id}:${token}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  });

  const result = await acceptInvite(token, session.user.id);

  if (result.kind === "joined" || result.kind === "already_member") {
    redirect(`/app/duplas/${result.pairId}`);
  }

  redirect(`/convite/${token}`);
}
