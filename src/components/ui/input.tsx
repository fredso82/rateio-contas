import * as React from "react";

import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-13 w-full rounded-[1.25rem] border border-line-strong bg-white/75 px-4 text-base text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/12",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
