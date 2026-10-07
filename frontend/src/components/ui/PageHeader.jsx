export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-brand">{eyebrow}</p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions}
    </header>
  );
}
