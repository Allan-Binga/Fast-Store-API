import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { errorMessage } from "../api";
import { Button, Field, inputClass } from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Login() {
  const { admin, login, notify } = useAdmin();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  if (admin) return <Navigate to="/" replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await login(form);
      navigate(location.state?.from || "/", { replace: true });
    } catch (error) {
      notify(errorMessage(error, "Unable to sign in."), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in with your administrator account."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email address">
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>
        <Field label="Password">
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </Field>
        <Button disabled={busy} className="w-full">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <p className="text-center text-xs text-muted">
          Provisioning a new administrator?{" "}
          <Link className="font-bold text-primary" to="/register">
            Register securely
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}

export function AuthFrame({ title, subtitle, children }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <section className="w-full max-w-md rounded-md border-2 border-slate-300 bg-white p-7 sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-sm bg-primary text-white">
            <span className="material-symbols-outlined">storefront</span>
          </span>
          <div>
            <strong className="text-xl">FastStore</strong>
            <p className="text-xs text-muted">Administrator console</p>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
