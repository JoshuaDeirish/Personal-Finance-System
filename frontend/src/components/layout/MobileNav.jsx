import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MOBILE_TABS, NAV_SECTIONS } from "../../navigation";
import { useAuth } from "../../auth/AuthContext";
import Icon from "../ui/Icon";

const SHORT_LABELS = { "/": "Home", "/transactions": "Activity", "/planner": "Plan", "/cash-flow": "Cash Flow" };

function tabClass({ isActive }) {
  return `flex flex-1 flex-col items-center gap-1 pt-2 pb-1.5 text-[11px] font-medium ${
    isActive ? "text-brand" : "text-muted"
  }`;
}

/**
 * Phone navigation: four pinned tabs plus a "More" sheet with every section,
 * designed for thumbs rather than a shrunken desktop sidebar.
 */
export default function MobileNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setIsMoreOpen(false), [location.pathname]);

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="flex">
          {MOBILE_TABS.map((item) => (
            <li key={item.path} className="flex flex-1">
              <NavLink to={item.path} end className={tabClass}>
                <Icon name={item.icon} className="size-6" />
                {SHORT_LABELS[item.path]}
              </NavLink>
            </li>
          ))}
          <li className="flex flex-1">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMoreOpen}
              className={tabClass({ isActive: isMoreOpen })}
            >
              <Icon name="more" className="size-6" />
              More
            </button>
          </li>
        </ul>
      </nav>
      {isMoreOpen && <MoreSheet onClose={() => setIsMoreOpen(false)} />}
    </>
  );
}

function MoreSheet({ onClose }) {
  const { user, logout } = useAuth();
  const closeButton = useRef(null);

  useEffect(() => {
    closeButton.current?.focus();
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="All sections">
      <button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl bg-surface px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="truncate text-sm text-muted">{user?.email}</p>
          <button
            ref={closeButton}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-surface-muted"
          >
            <Icon name="close" title="Close" />
          </button>
        </div>
        {NAV_SECTIONS.map((section, index) => (
          <div key={section.title || index} className="mb-4">
            {section.title && (
              <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted/80">
                {section.title}
              </p>
            )}
            <ul className="grid grid-cols-2 gap-2">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl border px-3 py-3 text-sm font-medium ${
                        isActive ? "border-brand bg-brand-soft text-brand-strong" : "border-line text-ink"
                      }`
                    }
                  >
                    <Icon name={item.icon} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-3 text-sm font-medium text-negative"
        >
          <Icon name="logout" />
          Sign out
        </button>
      </div>
    </div>
  );
}
