import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="text-center" variant="soft">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent-soft text-brand">
        {icon}
      </div>
      <h3 className="font-display mt-5 text-3xl leading-none">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-base text-muted">
        {description}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </Card>
  );
}
