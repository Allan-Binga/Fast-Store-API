import { useCallback, useEffect, useMemo, useState } from "react";
import { adminApi, errorMessage, publicApi } from "../api";
import { AdminContext } from "./AdminContext";

export default function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, tone = "success") => {
    setToast({ id: Date.now(), message, tone });
  }, []);

  useEffect(() => {
    publicApi
      .get("/admin/auth/check-session")
      .then(({ data }) => setAdmin(data.administrator || data.user || data))
      .catch(() => setAdmin(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const expire = () => setAdmin(null);
    window.addEventListener("admin-session-expired", expire);
    return () => window.removeEventListener("admin-session-expired", expire);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await publicApi.post("/admin/auth/login", credentials);
    setAdmin(data.administrator || data.user || data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminApi.post("/admin/auth/logout");
    } catch (error) {
      notify(errorMessage(error, "The local session was cleared."), "warning");
    } finally {
      setAdmin(null);
    }
  }, [notify]);

  const value = useMemo(
    () => ({ admin, checkingSession, login, logout, notify }),
    [admin, checkingSession, login, logout, notify],
  );

  return (
    <AdminContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[100] max-w-sm rounded-xl border-2 border-white/20 px-4 py-3 text-sm font-semibold text-white ${toast.tone === "error" ? "bg-red-600" : toast.tone === "warning" ? "bg-amber-600" : "bg-slate-900"}`}
        >
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px]">
              {toast.tone === "error" ? "error" : "check_circle"}
            </span>
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="ml-auto"
            >
              <span className="material-symbols-outlined text-[18px]">
                close
              </span>
            </button>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
}
