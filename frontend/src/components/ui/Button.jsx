import Spinner from "./Spinner";

const VARIANTS = {
  primary: "bg-brand text-on-brand hover:bg-brand-strong",
  secondary: "bg-surface text-ink border border-line hover:bg-surface-muted",
  ghost: "text-muted hover:text-ink hover:bg-surface-muted",
  danger: "bg-surface text-negative border border-line hover:bg-surface-muted",
};

export default function Button({
  variant = "primary",
  type = "button",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {isLoading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}
