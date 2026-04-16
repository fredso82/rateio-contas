import { cn } from "@/lib/utils";

type LoaderProps = {
  className?: string;
  label?: string;
};

export function Loader({ className, label = "Carregando" }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative size-12">
        <span className="absolute inset-0 rounded-full border-4 border-brand/15" />
        <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand" />
      </div>
      <span className="text-sm font-semibold text-muted">{label}</span>
    </div>
  );
}
