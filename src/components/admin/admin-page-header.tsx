type AdminPageHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

function AdminPageHeader({
  title,
  description,
  eyebrow,
}: AdminPageHeaderProps) {
  return (
    <div className="border-foreground max-w-3xl space-y-2 border-b-[1.5px] pb-5">
      {eyebrow ? (
        <p className="text-muted-foreground font-mono text-xs font-medium tracking-[0.06em] uppercase">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-heading text-3xl leading-tight font-semibold tracking-[-0.025em] wrap-anywhere text-balance">
        {title}
      </h1>
      <p className="text-muted-foreground max-w-2xl leading-7">{description}</p>
    </div>
  );
}

export { AdminPageHeader };
