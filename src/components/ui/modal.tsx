"use client";

import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

type ModalProps = {
  title: string;
  description?: string;
  trigger: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({
  title,
  description,
  trigger,
  children,
  footer,
  className,
}: ModalProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "glass-card fixed inset-x-4 top-1/2 z-50 max-h-[85vh] w-auto max-w-xl -translate-y-1/2 rounded-[2rem] border p-6 shadow-[0_30px_90px_rgba(31,26,22,0.24)] outline-none sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2",
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-3xl leading-none">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-3 text-base text-muted">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            <Dialog.Close className="flex size-10 items-center justify-center rounded-full border border-line bg-white/80 text-foreground transition hover:bg-white">
              <X className="size-4" />
              <span className="sr-only">Fechar</span>
            </Dialog.Close>
          </div>
          <div className="mt-6">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
