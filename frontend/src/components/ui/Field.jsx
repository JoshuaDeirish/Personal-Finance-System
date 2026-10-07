import { useId } from "react";

/** Labelled input with hint and error text wired up for screen readers. */
export default function Field({ label, error, hint, className = "", ...inputProps }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`block w-full rounded-xl border bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:outline-2 focus:outline-offset-0 focus:outline-brand sm:text-sm ${
          error ? "border-negative" : "border-line"
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-negative">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
