import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  title: string;
  /** Only when it says something the title does not. */
  description?: string;
  /** @deprecated The admin shows no label above titles; ignored. */
  eyebrow?: string;
  actions?: ReactNode;
};

function AdminPageHeader({
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="text-[1.75rem] leading-tight font-bold tracking-[-0.015em] text-balance md:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="text-muted-foreground max-w-[65ch]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export { AdminPageHeader };
