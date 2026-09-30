import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { customerRequest, errorMessage } from "../api";
import Modal from "../components/Modal";
import CustomerAccountNav from "../components/CustomerAccountNav";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import SignInLink from "../components/SignInLink";
import { useStore } from "../store/context";

const fields = [
  ["firstName", "First name", "given-name"],
  ["lastName", "Last name", "family-name"],
  ["email", "Email address", "email"],
  ["street", "Street address", "street-address"],
  ["city", "City", "address-level2"],
  ["state", "State / region", "address-level1"],
  ["postalCode", "Postal code", "postal-code"],
  ["phone", "Phone number", "tel"],
];
const primaryButton =
  "rounded-sm bg-primary px-5 py-2.5 font-semibold text-white hover:bg-secondary disabled:opacity-50";
const secondaryButton =
  "rounded-sm border border-outline-variant px-4 py-2 hover:bg-surface-container-low disabled:opacity-50";

function addressPayload(address) {
  return {
    ...Object.fromEntries(
      fields.map(([key]) => [key, address[key]?.trim() || ""]),
    ),
    isDefault: Boolean(address.isDefault),
  };
}

function AddressBook() {
  const { session, invalidateSession } = useStore();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const mounted = useRef(false);
  const requestVersion = useRef(0);

  const loadAddresses = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setLoadError("");
    try {
      const { data } = await customerRequest({ url: "/address/user" });
      if (mounted.current && version === requestVersion.current)
        setAddresses(data);
    } catch (failure) {
      if (!mounted.current || version !== requestVersion.current) return;
      if ([401, 403].includes(failure.response?.status)) invalidateSession();
      else setLoadError(errorMessage(failure));
    } finally {
      if (mounted.current && version === requestVersion.current)
        setLoading(false);
    }
  }, [invalidateSession]);

  // Keep the initial load tied to this account, not provider callback identity.
  const initialLoad = useRef(loadAddresses);
  useEffect(() => {
    mounted.current = true;
    void initialLoad.current();
    return () => {
      mounted.current = false;
      requestVersion.current += 1;
    };
  }, []);

  function openEditor(address) {
    setError("");
    setEditor(
      address || { ...addressPayload({}), email: session.user.email || "" },
    );
  }

  async function mutate(config, message) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await customerRequest(config);
      if (!mounted.current) return;
      setEditor(null);
      setDeleting(null);
      setNotice(message);
      // Re-read the owner's authoritative default selection after every mutation.
      await loadAddresses();
    } catch (failure) {
      if (!mounted.current) return;
      if ([401, 403].includes(failure.response?.status)) invalidateSession();
      else setError(errorMessage(failure));
    } finally {
      locked.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  function saveAddress(event) {
    event.preventDefault();
    const data = addressPayload(editor);
    if (fields.some(([key]) => !data[key])) {
      setError(
        "Please complete every address field. Spaces alone are not valid.",
      );
      return;
    }
    void mutate(
      {
        method: editor._id ? "put" : "post",
        url: editor._id ? `/address/update/${editor._id}` : "/address/add/user",
        data,
      },
      editor._id ? "Address updated." : "Address added.",
    );
  }

  function closeDialog(event) {
    // Prevent Escape from closing a dialog while its request is in progress.
    event?.preventDefault();
    if (locked.current) return;
    setEditor(null);
    setDeleting(null);
    setError("");
  }

  return (
    <>
      <header className="mb-8 flex flex-col justify-between gap-4 border-b border-outline-variant/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg tracking-tight">
            Saved Addresses
          </h1>
          <p className="mt-1 text-on-surface-variant">
            Manage your shipping destinations for faster checkout
          </p>
        </div>
        <button
          className={primaryButton}
          disabled={busy || loading}
          onClick={() => openEditor()}
        >
          <span aria-hidden="true">＋ </span>Add new address
        </button>
      </header>
      {notice && (
        <p
          role="status"
          className="mb-6 rounded-sm bg-surface-container-high p-4 text-primary"
        >
          {notice}
        </p>
      )}
      {error && !editor && !deleting && (
        <p role="alert" className="mb-6 text-error">
          {error}
        </p>
      )}
      {loading && (
        <p role="status" className="py-8">
          Loading saved addresses…
        </p>
      )}
      {loadError && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-error bg-error-container/30 p-5"
        >
          <h2 className="font-semibold">Could not load saved addresses</h2>
          <p className="my-2">{loadError}</p>
          <button
            className={secondaryButton}
            disabled={loading || busy}
            onClick={loadAddresses}
          >
            Retry
          </button>
        </div>
      )}
      {!loading && !loadError && (
        <section
          aria-label="Address list"
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {addresses.map((address) => (
            <article
              key={address._id}
              className={`flex min-w-0 flex-col justify-between rounded-md border-2 bg-surface-container-lowest p-6 shadow-sm ${address.isDefault ? "border-primary" : "border-outline-variant"}`}
            >
              <div className="break-words">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-xl font-semibold">
                    {address.firstName} {address.lastName}
                  </h2>
                  {address.isDefault && (
                    <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-semibold text-primary">
                      Default Shipping
                    </span>
                  )}
                </div>
                <address className="mb-5 space-y-1.5 not-italic text-on-surface-variant">
                  <p className="font-medium text-on-surface">
                    {address.street}
                  </p>
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <div className="mt-3 space-y-1 border-t border-outline-variant/30 pt-3 text-sm">
                    <p>{address.email}</p>
                    <p>{address.phone}</p>
                  </div>
                </address>
              </div>
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 pt-4">
                <div className="flex items-center gap-3">
                  <button
                    disabled={busy}
                    className={secondaryButton}
                    onClick={() => openEditor(address)}
                  >
                    Edit
                  </button>
                  <button
                    disabled={busy}
                    className="text-error disabled:opacity-50"
                    aria-label={`Delete address for ${address.firstName} ${address.lastName}`}
                    onClick={() => {
                      setError("");
                      setDeleting(address);
                    }}
                  >
                    Delete
                  </button>
                </div>
                {address.isDefault ? (
                  <span className="text-xs font-medium text-primary">
                    Active Default
                  </span>
                ) : (
                  <button
                    disabled={busy}
                    className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
                    onClick={() =>
                      mutate(
                        {
                          method: "put",
                          url: `/address/update/${address._id}`,
                          data: { ...addressPayload(address), isDefault: true },
                        },
                        "Default shipping address updated.",
                      )
                    }
                  >
                    Set as default
                  </button>
                )}
              </footer>
            </article>
          ))}
          <button
            disabled={busy}
            onClick={() => openEditor()}
            className="flex min-h-64 flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-outline-variant p-6 text-primary hover:bg-surface-container-low disabled:opacity-50"
          >
            <span aria-hidden="true" className="text-4xl">
              ＋
            </span>
            <span className="font-semibold">
              {addresses.length
                ? "Add another address"
                : "Add your first address"}
            </span>
            {!addresses.length && (
              <span className="text-sm text-on-surface-variant">
                Your saved shipping addresses will appear here.
              </span>
            )}
          </button>
        </section>
      )}
      {editor && (
        <Modal
          title={editor._id ? "Edit address" : "Add new address"}
          onClose={closeDialog}
        >
          <form onSubmit={saveAddress}>
            <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
              {fields.map(([key, label, autoComplete]) => (
                <label
                  key={key}
                  className={
                    ["email", "street", "phone"].includes(key)
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <span className="mb-1 block text-sm font-semibold">
                    {label} <span className="text-error">*</span>
                  </span>
                  <input
                    required
                    name={key}
                    autoComplete={autoComplete}
                    type={
                      key === "email"
                        ? "email"
                        : key === "phone"
                          ? "tel"
                          : "text"
                    }
                    value={editor[key]}
                    onChange={(event) =>
                      setEditor({ ...editor, [key]: event.target.value })
                    }
                    className="w-full rounded-sm border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 focus:outline-primary"
                  />
                </label>
              ))}
              <label className="flex items-start gap-3 py-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={editor.isDefault}
                  onChange={(event) =>
                    setEditor({ ...editor, isDefault: event.target.checked })
                  }
                  className="mt-1 h-5 w-5 accent-primary"
                />
                <span>Make this my default shipping address</span>
              </label>
            </fieldset>
            {error && (
              <p role="alert" className="my-4 text-error">
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3 border-t border-outline-variant pt-4">
              <button
                type="button"
                disabled={busy}
                className={secondaryButton}
                onClick={closeDialog}
              >
                Cancel
              </button>
              <button disabled={busy} type="submit" className={primaryButton}>
                {busy ? "Saving…" : "Save address"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleting && (
        <Modal title="Delete address?" onClose={closeDialog}>
          <div className="mb-4 break-words rounded-sm bg-surface-container-low p-4">
            <p className="font-semibold">
              {deleting.firstName} {deleting.lastName}
            </p>
            <p>
              {deleting.street}, {deleting.city}, {deleting.state}{" "}
              {deleting.postalCode}
            </p>
          </div>
          <p>This permanently removes the address from your saved addresses.</p>
          {error && (
            <p role="alert" className="mt-4 text-error">
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              disabled={busy}
              className={secondaryButton}
              onClick={closeDialog}
            >
              Cancel
            </button>
            <button
              disabled={busy}
              className="rounded-sm bg-error px-5 py-2.5 font-semibold text-white disabled:opacity-50"
              onClick={() =>
                mutate(
                  { method: "delete", url: `/address/delete/${deleting._id}` },
                  "Address deleted.",
                )
              }
            >
              {busy ? "Deleting…" : "Delete address"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

export default function Address() {
  const [params] = useSearchParams();
  const { session, checkSession } = useStore();
  useEffect(() => {
    document.title = "Saved Addresses | FastStore";
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <TopNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
        {params.get("returnTo") === "checkout" && (
          <Link
            to="/checkout"
            className="mb-4 inline-block font-semibold text-primary"
          >
            ← Return to checkout
          </Link>
        )}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap gap-2 text-sm text-on-surface-variant"
        >
          <Link to="/" className="hover:text-primary">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Saved Addresses</span>
        </nav>
        {session.status === "authenticated" ? (
          <>
            <CustomerAccountNav />
            <AddressBook key={session.user._id || session.user.email} />
          </>
        ) : (
          <section className="rounded-md border border-outline-variant bg-surface-container-lowest p-8">
            <h1 className="mb-4 text-3xl font-semibold">Saved Addresses</h1>
            {session.status === "checking" ? (
              <p role="status">Checking your session…</p>
            ) : session.status === "error" ? (
              <>
                <p role="alert" className="mb-4">
                  We could not check your account.
                </p>
                <button className={primaryButton} onClick={checkSession}>
                  Try again
                </button>
              </>
            ) : (
              <>
                <p className="mb-6">
                  Sign in to manage your shipping addresses.
                </p>
                <SignInLink className={`${primaryButton} inline-block`}>
                  Sign in
                </SignInLink>
                <Link to="/register" className="ml-4 text-primary underline">
                  Create account
                </Link>
              </>
            )}
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
