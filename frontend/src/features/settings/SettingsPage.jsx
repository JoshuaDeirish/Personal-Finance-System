import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { authApi } from "../../api/auth";
import { getErrorMessage, getFieldErrors } from "../../api/client";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Field from "../../components/ui/Field";
import PageHeader from "../../components/ui/PageHeader";

const PROFILE_FIELDS = ["first_name", "last_name", "date_of_birth", "currency", "timezone", "safety_buffer"];

const TIME_ZONES = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [];

function profileFrom(user) {
  return Object.fromEntries(PROFILE_FIELDS.map((key) => [key, user?.[key] ?? ""]));
}

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Your profile and the preferences the planner uses." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard />
        <PasswordCard />
      </div>
    </>
  );
}

function ProfileCard() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState(() => profileFrom(user));
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ tone: "info", text: "" });
  const [isSaving, setIsSaving] = useState(false);

  const update = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setMessage({ tone: "info", text: "" });
    try {
      const updated = await updateProfile({ ...form, date_of_birth: form.date_of_birth || null });
      setForm(profileFrom(updated));
      setMessage({ tone: "success", text: "Profile saved." });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setMessage({ tone: "error", text: getErrorMessage(err, "Please fix the highlighted fields.") });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card title="Profile" description={user?.email}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone={message.tone}>{message.text}</Alert>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" autoComplete="given-name" value={form.first_name}
            onChange={update("first_name")} error={fieldErrors.first_name} />
          <Field label="Last name" autoComplete="family-name" value={form.last_name}
            onChange={update("last_name")} error={fieldErrors.last_name} />
        </div>
        <Field label="Date of birth" type="date" value={form.date_of_birth}
          onChange={update("date_of_birth")} error={fieldErrors.date_of_birth}
          hint="Used for age-based goals like “$100k by 26”." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency" maxLength={3} value={form.currency}
            onChange={update("currency")} error={fieldErrors.currency} />
          <div>
            <label htmlFor="timezone" className="mb-1.5 block text-sm font-medium text-ink">Time zone</label>
            <select id="timezone" value={form.timezone} onChange={update("timezone")}
              className="block w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-ink focus:outline-2 focus:outline-brand sm:text-sm">
              {(TIME_ZONES.includes(form.timezone) ? TIME_ZONES : [form.timezone, ...TIME_ZONES]).map((zone) => <option key={zone} value={zone}>{zone}</option>)}
            </select>
            {fieldErrors.timezone && <p className="mt-1.5 text-sm text-negative">{fieldErrors.timezone}</p>}
          </div>
        </div>
        <Field label="Safety buffer" inputMode="decimal" value={form.safety_buffer}
          onChange={update("safety_buffer")} error={fieldErrors.safety_buffer}
          hint="A cushion Safe to Spend always keeps aside, so you never plan down to $0." />
        <Button type="submit" isLoading={isSaving}>Save profile</Button>
      </form>
    </Card>
  );
}

function PasswordCard() {
  const { logout } = useAuth();
  const empty = { current_password: "", new_password: "" };
  const [form, setForm] = useState(empty);
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState({ tone: "info", text: "" });
  const [isSaving, setIsSaving] = useState(false);

  const update = (name) => (event) => setForm((current) => ({ ...current, [name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setMessage({ tone: "info", text: "" });
    try {
      await authApi.changePassword(form);
      setForm(empty);
      setMessage({ tone: "success", text: "Password changed. Other devices have been signed out." });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setMessage({ tone: "error", text: getErrorMessage(err, "Please fix the highlighted fields.") });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card title="Security">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Alert tone={message.tone}>{message.text}</Alert>
        <Field label="Current password" type="password" autoComplete="current-password"
          value={form.current_password} onChange={update("current_password")}
          error={fieldErrors.current_password} />
        <Field label="New password" type="password" autoComplete="new-password"
          value={form.new_password} onChange={update("new_password")}
          error={fieldErrors.new_password} hint="At least 10 characters, not a common password." />
        <div className="flex flex-wrap gap-3">
          <Button type="submit" isLoading={isSaving}>Change password</Button>
          <Button variant="danger" onClick={logout}>Sign out</Button>
        </div>
      </form>
    </Card>
  );
}
