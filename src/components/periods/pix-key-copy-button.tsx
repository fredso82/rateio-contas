"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type PixKeyCopyButtonProps = {
  pixKey: string;
};

export function PixKeyCopyButton({ pixKey }: PixKeyCopyButtonProps) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(pixKey);
      toast.success("Chave Pix copiada.");
    } catch {
      toast.error("Não foi possível copiar a chave Pix agora.");
    }
  }

  return (
    <Button onClick={handleCopy} type="button" variant="secondary">
      <Copy className="size-4" />
      Copiar chave Pix
    </Button>
  );
}
