"use client";

import { useMemo } from "react";
import { Copy, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type InviteLinkCardProps = {
  token: string;
  expiresAt: string;
};

export function InviteLinkCard({ token, expiresAt }: InviteLinkCardProps) {
  const sharePath = useMemo(() => `/convite/${token}`, [token]);

  function getInviteUrl() {
    if (typeof window === "undefined") {
      return sharePath;
    }

    return `${window.location.origin}${sharePath}`;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(getInviteUrl());
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar o link agora.");
    }
  }

  async function handleShare() {
    if (!navigator.share) {
      return;
    }

    try {
      await navigator.share({
        title: "Convite para entrar na dupla",
        text: "Use este link para entrar na dupla no Rateio.",
        url: getInviteUrl(),
      });
    } catch {
      toast.error("Não foi possível compartilhar o link agora.");
    }
  }

  return (
    <div className="rounded-[1.5rem] border border-line-strong bg-white/80 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-[1rem] bg-accent-soft text-brand">
          <Link2 className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Link atual</p>
          <p className="text-sm text-muted">
            Expira em {new Intl.DateTimeFormat("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(new Date(expiresAt))}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[1.25rem] border border-line bg-background/75 px-4 py-3 font-mono text-sm break-all">
        {sharePath}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button fullWidth onClick={handleCopy} type="button" variant="secondary">
          <Copy className="size-4" />
          Copiar link
        </Button>
        {typeof navigator !== "undefined" && "share" in navigator ? (
          <Button fullWidth onClick={handleShare} type="button">
            <Share2 className="size-4" />
            Compartilhar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
