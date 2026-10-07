/**
 * Small inline icon set (no icon library dependency). 24×24, stroke-based,
 * inherits colour from the surrounding text.
 */
const ICONS = {
  home: (
    <>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  accounts: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16.5" cy="14.5" r="1" />
    </>
  ),
  transactions: (
    <>
      <path d="M9 6h12M9 12h12M9 18h12" />
      <circle cx="4.5" cy="6" r="1" />
      <circle cx="4.5" cy="12" r="1" />
      <circle cx="4.5" cy="18" r="1" />
    </>
  ),
  income: (
    <>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 17v3h16v-3" />
    </>
  ),
  recurring: (
    <>
      <path d="M4 12a8 8 0 0 1 13.7-5.6" />
      <path d="M18 3v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6" />
      <path d="M6 21v-4h4" />
    </>
  ),
  planner: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9h9" />
    </>
  ),
  budgets: (
    <>
      <path d="M3 20h18" />
      <path d="M6 16v-5" />
      <path d="M11 16V6" />
      <path d="M16 16v-8" />
    </>
  ),
  allocations: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  cashflow: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  goals: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h12l-2 4 2 4H5" />
    </>
  ),
  afford: (
    <>
      <path d="M5 8h14l-1 12H6L5 8z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  debts: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20M6 15h4" />
    </>
  ),
  debtPlan: (
    <>
      <path d="M3 6l6 6 4-4 8 8" />
      <path d="M21 11v5h-5" />
    </>
  ),
  scenarios: (
    <>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M6 7v10" />
      <path d="M18 9c0 5-6 6-10.5 9" />
    </>
  ),
  settings: (
    <>
      <path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  more: (
    <>
      <circle cx="5" cy="12" r="1.25" fill="currentColor" />
      <circle cx="12" cy="12" r="1.25" fill="currentColor" />
      <circle cx="19" cy="12" r="1.25" fill="currentColor" />
    </>
  ),
  logout: (
    <>
      <path d="M15 4h4v16h-4" />
      <path d="M10 8l-4 4 4 4" />
      <path d="M6 12h10" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6L6 18" />,
};

export default function Icon({ name, className = "size-5", title }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title && <title>{title}</title>}
      {ICONS[name]}
    </svg>
  );
}
