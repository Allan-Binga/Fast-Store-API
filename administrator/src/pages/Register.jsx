import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { errorMessage, publicApi } from "../api";
import { Button, Field, inputClass } from "../components/UI";
import { useAdmin } from "../store/AdminContext";
import { AuthFrame } from "./Login";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    registrationKey: "",
  });
  const [busy, setBusy] = useState(false);
  const { notify } = useAdmin();
  const navigate = useNavigate();
  const update = (name) => (event) =>
    setForm((current) => ({ ...current, [name]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const { registrationKey, ...body } = form;
      await publicApi.post("/admin/auth/register", body, {
        headers: { "X-Admin-Registration-Key": registrationKey },
      });
      notify(
        "Administrator account created. Verify its email before signing in.",
      );
      navigate("/login");
    } catch (error) {
      notify(errorMessage(error, "Unable to register."), "error");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AuthFrame
      title="Create administrator"
      subtitle="The server registration key is required and is never stored in the browser."
    >
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <Field label="First name">
          <input
            className={inputClass}
            required
            value={form.firstName}
            onChange={update("firstName")}
          />
        </Field>
        <Field label="Last name">
          <input
            className={inputClass}
            required
            value={form.lastName}
            onChange={update("lastName")}
          />
        </Field>
        <div className="col-span-2">
          <Field label="Email">
            <input
              className={inputClass}
              type="email"
              required
              value={form.email}
              onChange={update("email")}
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Phone">
            <input
              className={inputClass}
              type="tel"
              required
              value={form.phone}
              onChange={update("phone")}
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Password">
            <input
              className={inputClass}
              type="password"
              minLength="8"
              required
              value={form.password}
              onChange={update("password")}
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Admin registration key">
            <input
              className={inputClass}
              type="password"
              required
              value={form.registrationKey}
              onChange={update("registrationKey")}
            />
          </Field>
        </div>
        <Button className="col-span-2" disabled={busy}>
          {busy ? "Creating…" : "Create administrator"}
        </Button>
        <p className="col-span-2 text-center text-xs text-muted">
          <Link className="font-bold text-primary" to="/login">
            Back to sign in
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
