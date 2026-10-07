import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getErrorMessage, getFieldErrors } from "../../api/client";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Field from "../../components/ui/Field";
import FullPageSpinner from "../../components/ui/FullPageSpinner";
import AuthShell from "./AuthShell";

export default function RegisterPage() {
  const { user, isLoading, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ first_name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return <FullPageSpinner />;
  if (user) return <Navigate to="/" replace />;

  const update = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    setFieldErrors({});
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      setFieldErrors(fields);
      if (err.response?.status === 404) {
        setError("Sign-up is turned off for this app. Ask the owner for an account.");
      } else if (!Object.keys(fields).length) {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Your data is private to you."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand hover:text-brand-strong">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone="error">{error}</Alert>
        <Field
          label="First name"
          autoComplete="given-name"
          value={form.first_name}
          onChange={update("first_name")}
          error={fieldErrors.first_name}
        />
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
          autoComplete="new-password"
          required
          hint="At least 10 characters, not a common password."
          value={form.password}
          onChange={update("password")}
          error={fieldErrors.password}
        />
        <Button type="submit" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
