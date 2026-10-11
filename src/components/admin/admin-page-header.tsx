type AdminPageHeaderProps = {
  title: string;
  description: string;
};

function AdminPageHeader({ title, description }: AdminPageHeaderProps) {
  return (
    <div className="max-w-2xl space-y-3 border-b pb-6">
      <h1 className="font-heading text-brand-burgundy text-2xl font-semibold tracking-tight wrap-anywhere text-balance md:text-3xl">
        {title}
      </h1>
      <p className="text-muted-foreground leading-7">{description}</p>
    </div>
  );
}

export { AdminPageHeader };
