import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import Logo from "./Logo";

export default function AppLayout() {
  return (
    <div className="min-h-dvh">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Sidebar />
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur md:hidden">
        <div className="flex h-14 items-center">
          <Logo />
        </div>
      </header>
      <main id="main" className="md:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 md:py-10 md:pb-10 lg:px-10">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
