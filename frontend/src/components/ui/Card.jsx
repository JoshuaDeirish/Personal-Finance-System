export default function Card({ title, description, actions, className = "", children }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-5 sm:p-6 ${className}`}>
      {(title || actions) && (
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}
