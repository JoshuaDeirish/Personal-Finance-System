import { NavLink } from "react-router-dom";
import { NAV_SECTIONS } from "../../navigation";
import { useAuth } from "../../auth/AuthContext";
import Icon from "../ui/Icon";
import Logo from "./Logo";

function linkClass({ isActive }) {
  return `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-brand-soft text-brand-strong" : "text-muted hover:bg-surface-muted hover:text-ink"
  }`;
}

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-line bg-surface md:flex">
      <div className="px-5 py-5">
        <Logo />
      </div>
      <nav aria-label="Main" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV_SECTIONS.map((section, index) => (
          <div key={section.title || index}>
            {section.title && (
              <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-muted/80">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink to={item.path} end className={linkClass}>
                    <Icon name={item.icon} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex items-center justify-between gap-2 border-t border-line px-5 py-4">
        <p className="truncate text-sm text-muted" title={user?.email}>
          {user?.first_name || user?.email}
        </p>
        <button
          type="button"
          onClick={logout}
          className="rounded-lg p-1.5 text-muted hover:bg-surface-muted hover:text-ink"
        >
          <Icon name="logout" title="Sign out" />
        </button>
      </div>
    </aside>
  );
}
