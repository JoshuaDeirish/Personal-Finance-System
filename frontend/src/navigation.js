/**
 * Single source of truth for app navigation: drives the desktop sidebar, the
 * mobile "More" sheet and the route table. `phase` marks screens that are
 * placeholders until that build phase lands.
 */
export const NAV_SECTIONS = [
  {
    items: [
      {
        path: "/",
        label: "Dashboard",
        icon: "home",
        phase: 4,
        description: "Safe to Spend, this week's spending, upcoming bills, next income, goals and warnings.",
      },
    ],
  },
  {
    title: "Money",
    items: [
      { path: "/accounts", label: "Accounts", icon: "accounts", phase: 2,
        description: "Where your money and debt live: chequing, savings, credit cards, loans and cash." },
      { path: "/transactions", label: "Transactions", icon: "transactions", phase: 2,
        description: "What actually happened. Search, filter, add expenses and income, and move money between accounts." },
      { path: "/income", label: "Income", icon: "income", phase: 2,
        description: "Your income sources and how reliable each one is." },
      { path: "/recurring", label: "Recurring", icon: "recurring", phase: 2,
        description: "Bills, subscriptions and paycheques you expect, including per-session costs like training." },
    ],
  },
  {
    title: "Planning",
    items: [
      { path: "/planner", label: "Paycheque Planner", icon: "planner", phase: 3,
        description: "Give every dollar of your next paycheque a job and see the tradeoffs live." },
      { path: "/budgets", label: "Budgets", icon: "budgets", phase: 3,
        description: "Spending targets per category, with planned vs. actual." },
      { path: "/allocations", label: "Allocations", icon: "allocations", phase: 3,
        description: "Every job you've assigned your money, by pay period." },
      { path: "/cash-flow", label: "Cash Flow", icon: "cashflow", phase: 4,
        description: "A day-by-day timeline of expected bills, income and your projected balance." },
    ],
  },
  {
    title: "Goals",
    items: [
      { path: "/goals", label: "Goals", icon: "goals", phase: 5,
        description: "Progress, required contributions and whether you're on pace." },
      { path: "/afford", label: "Can I Afford This?", icon: "afford", phase: 6,
        description: "Check a purchase against your cash flow, Safe to Spend and goals before you buy." },
    ],
  },
  {
    title: "Debt",
    items: [
      { path: "/debts", label: "Debts", icon: "debts", phase: 5,
        description: "Balances, interest rates, minimum payments and due dates." },
      { path: "/debts/plan", label: "Debt Planning", icon: "debtPlan", phase: 5,
        description: "Payoff projections and the effect of paying extra." },
    ],
  },
  {
    items: [
      { path: "/scenarios", label: "Scenarios", icon: "scenarios", phase: 6,
        description: "What happens if you buy the car, move, or change jobs? Compare against today." },
      { path: "/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

/** The four destinations pinned to the mobile tab bar (plus "More"). */
export const MOBILE_TABS = ["/", "/transactions", "/planner", "/cash-flow"].map((path) =>
  NAV_ITEMS.find((item) => item.path === path),
);
