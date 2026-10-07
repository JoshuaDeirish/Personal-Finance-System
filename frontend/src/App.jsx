import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import ComingSoon from "./features/placeholder/ComingSoon";
import NotFound from "./features/placeholder/NotFound";
import SettingsPage from "./features/settings/SettingsPage";
import { NAV_ITEMS } from "./navigation";

// Screens built so far. Everything else in NAV_ITEMS renders a placeholder.
const PAGES = {
  "/settings": SettingsPage,
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              {NAV_ITEMS.map((item) => {
                const Page = PAGES[item.path];
                return (
                  <Route
                    key={item.path}
                    path={item.path}
                    element={Page ? <Page /> : <ComingSoon item={item} />}
                  />
                );
              })}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
