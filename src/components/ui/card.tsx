import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva("rounded-[1.75rem] border p-6", {
  variants: {
    variant: {
      default: "glass-card",
      soft: "section-frame",
      accent:
        "border-transparent bg-[linear-gradient(180deg,rgba(28,106,98,0.12),rgba(255,251,245,0.95))] shadow-[0_20px_50px_rgba(17,75,70,0.12)]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>;

export function Card({ className, variant, ...props }: CardProps) {
  return (
    <div className={cn(cardVariants({ variant }), className)} {...props} />
  );
}
