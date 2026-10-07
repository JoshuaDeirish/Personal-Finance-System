import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getErrorMessage, getFieldErrors } from "../../api/client";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import FullPageSpinner from "../../components/ui/FullPageSpinner";
import AuthShell from "./AuthShell";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <FullPageSpinner />;
  if (user) return <Navigate to={redirectTo} replace />;

  const update = (name) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [name]: value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      await login(form);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see what you can safely spend."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="font-semibold text-brand hover:text-brand-strong">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone="error">{error}</Alert>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={form.email}
          onChange={update("email")}
          error={fieldErrors.email}
        />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={update("password")}
          error={fieldErrors.password}
        />
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={update("remember")}
            className="size-4 rounded accent-brand"
          />
          Keep me signed in on this device
        </label>
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
