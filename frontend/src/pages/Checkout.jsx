import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PayPalOneTimePaymentButton,
  PayPalProvider,
} from "@paypal/react-paypal-js/sdk-v6";
import { customerRequest, errorMessage } from "../api";
import CheckoutLayout, {
  AccountRequired,
  panelClass,
  primaryClass,
  secondaryClass,
} from "../components/checkout/CheckoutLayout";
import { OrderItems } from "../components/checkout/OrderDetails";
import useCustomerResource from "../hooks/useCustomerResource";
import { useStore } from "../store/context";
import {
  clearCheckoutAttempt,
  paymentMoney,
  readCheckoutAttempt,
  saveCheckoutAttempt,
} from "../store/checkout";

const PAYMENT_METHODS = [
  {
    id: "stripe",
    title: "Credit or Debit Card",
    description: "Enter your card details on Stripe's hosted checkout page.",
    badge: "stripe",
  },
  {
    id: "paypal",
    title: "PayPal",
    description: "Approve the payment securely in the PayPal window.",
  },
  {
    id: "mpesa",
    title: "M-Pesa",
    description: "Receive a Safaricom prompt on your phone and enter your PIN.",
  },
];

function cartItemsForCheckout(items) {
  return items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
  }));
}

function checkoutBody(addressId, items) {
  return {
    source: "cart",
    addressId,
    items: cartItemsForCheckout(items),
  };
}

function checkoutAttempt(provider, addressId, items) {
  return {
    key: crypto.randomUUID(),
    provider,
    body: checkoutBody(addressId, items),
    displayItems: items,
  };
}

function selectedAddressId(attempt, selectedAddress, addresses) {
  return (
    attempt?.body.addressId ||
    selectedAddress ||
    addresses.find((address) => address.isDefault)?._id ||
    addresses[0]?._id ||
    ""
  );
}

function isRejectedPurchase(error) {
  return (
    [400, 404].includes(error.response?.status) ||
    error.response?.data?.checkoutCreated === false
  );
}

function assertStripeCheckoutUrl(url) {
  const destination = new URL(url);

  if (
    destination.protocol !== "https:" ||
    destination.hostname !== "checkout.stripe.com"
  ) {
    throw new Error("The payment link is unavailable. Please retry this checkout.");
  }

  return destination;
}

function SavedAttemptNotice({ attempt }) {
  if (!attempt) return null;

  return (
    <div className="mb-6 space-y-2 rounded-md border border-primary/30 bg-surface-container-low p-4">
      <p>
        A checkout attempt is saved for this purchase. Continue it to reuse the
        same payment session, or select a different payment method below.
      </p>
      <Link
        to={`/payment-result?checkout_key=${encodeURIComponent(attempt.key)}`}
        className="font-semibold text-primary underline"
      >
        Check payment status
      </Link>
      <p className="text-sm text-outline">
        The saved items and address stay attached to this attempt. Other payment
        sessions may still be pending; complete payment with only one method.
      </p>
    </div>
  );
}

function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <p role="alert" className="mb-6 rounded-md bg-error-container/40 p-4 text-error">
      {message}
    </p>
  );
}

function AddressCard({ address, checked, onChange }) {
  return (
    <label
      className={`min-w-0 cursor-pointer rounded-md border-2 p-4 ${
        checked ? "border-primary bg-surface-container-low/40" : "border-outline-variant"
      }`}
    >
      <div className="mb-2 flex items-start gap-2">
        <input
          type="radio"
          name="address"
          value={address._id}
          checked={checked}
          onChange={onChange}
          className="mt-1 accent-primary"
        />
        <span className="break-words font-semibold">
          {address.firstName} {address.lastName}
        </span>
      </div>
      {address.isDefault && (
        <span className="mb-2 inline-block rounded bg-surface-container-high px-2 py-1 text-xs text-primary">
          Default Shipping
        </span>
      )}
      <div className="space-y-1 break-words text-sm text-on-surface-variant">
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state} {address.postalCode}
        </p>
        <p>{address.phone}</p>
      </div>
    </label>
  );
}

function ShippingSection({
  addresses,
  addressId,
  attempt,
  busy,
  loading,
  selectedAddress,
  onAddressChange,
}) {
  const savedAddresses = addresses.data || [];

  return (
    <section className={panelClass} aria-labelledby="shipping-title">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
        <h2 id="shipping-title" className="text-xl font-semibold">
          1. Shipping Address
        </h2>
        {!attempt && (
          <Link to="/account/addresses?returnTo=checkout" className="font-semibold text-primary">
            + Add / edit address
          </Link>
        )}
      </div>

      {addresses.loading && <p role="status">Loading addresses...</p>}
      {addresses.error && (
        <div role="alert">
          <p className="mb-3 text-error">{addresses.error}</p>
          <button onClick={addresses.retry} className={secondaryClass}>
            Retry addresses
          </button>
        </div>
      )}
      {!addresses.loading && !addresses.error && savedAddresses.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-outline-variant p-6 text-center">
          <h3 className="font-semibold">No shipping addresses found</h3>
          <p className="my-3">Add a shipping address to continue.</p>
          <Link to="/account/addresses?returnTo=checkout" className={primaryClass}>
            Add new address
          </Link>
        </div>
      )}

      <fieldset disabled={busy || Boolean(attempt)} className="grid gap-4 md:grid-cols-2">
        <legend className="sr-only">Choose a shipping address</legend>
        {savedAddresses.map((address) => (
          <AddressCard
            key={address._id}
            address={address}
            checked={addressId === address._id}
            onChange={() => onAddressChange(address._id)}
          />
        ))}
      </fieldset>

      {attempt && !loading && !savedAddresses.some((address) => address._id === selectedAddress) && (
        <p className="mt-3 text-sm">
          The saved address is no longer listed. An existing order retains its
          original shipping details.
        </p>
      )}
    </section>
  );
}

function PaymentMethodCard({ method, selected, onSelect }) {
  return (
    <label
      className={`flex items-start gap-3 rounded-md border-2 p-5 ${
        selected ? "border-primary bg-surface-container-low/30" : "border-outline-variant"
      }`}
    >
      <input
        type="radio"
        name="provider"
        value={method.id}
        checked={selected}
        onChange={() => onSelect(method.id)}
        className="mt-1 accent-primary"
      />
      <span className="flex-1">
        <span className="block font-semibold">{method.title}</span>
        <span className="mt-1 block text-sm text-on-surface-variant">
          {method.description}
        </span>
      </span>
      {method.badge && (
        <span className="hidden font-extrabold text-[#635BFF] sm:block">
          {method.badge}
        </span>
      )}
    </label>
  );
}

function PaymentMethodSection({ provider, setProvider, busy }) {
  return (
    <section className={panelClass} aria-labelledby="payment-title">
      <h2
        id="payment-title"
        className="mb-5 border-b border-outline-variant/40 pb-4 text-xl font-semibold"
      >
        2. Payment Method
      </h2>
      <fieldset className="space-y-4" disabled={busy}>
        <legend className="sr-only">Choose a payment method</legend>
        {PAYMENT_METHODS.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={provider === method.id}
            onSelect={setProvider}
          />
        ))}
      </fieldset>
    </section>
  );
}

function ReviewSection({ attempt, cart, items, loading, unavailable }) {
  return (
    <section className={panelClass} aria-labelledby="review-title">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 pb-4">
        <h2 id="review-title" className="text-xl font-semibold">
          3. Order Items Review
        </h2>
        <Link to="/cart" className="font-semibold text-primary">
          Return to cart
        </Link>
      </div>

      {!attempt && cart.loading && (
        <p role="status" className="py-4">
          Checking prices and availability...
        </p>
      )}
      {!attempt && cart.error && (
        <div role="alert" className="py-4">
          <p className="mb-3 text-error">{cart.error}</p>
          <button onClick={cart.retry} className={secondaryClass}>
            Retry cart
          </button>
        </div>
      )}
      <OrderItems items={items} />
      {!loading && !cart.error && !items.length && (
        <p className="py-4">Your cart is empty. Add products before checking out.</p>
      )}
      {unavailable && !attempt && (
        <p role="alert" className="mt-3 text-error">
          Some quantities are unavailable. Update your cart before continuing.
        </p>
      )}
    </section>
  );
}

function MpesaPaymentForm({ phone, setPhone, blocked, phase, onSubmit }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold" htmlFor="mpesa-phone">
        Safaricom phone number
      </label>
      <input
        id="mpesa-phone"
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="0712345678"
        disabled={Boolean(blocked)}
        className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-3 outline-none focus:border-primary"
      />
      <button
        disabled={Boolean(blocked) || !phone.trim()}
        onClick={onSubmit}
        className={`${primaryClass} w-full`}
      >
        {phase === "submitting" ? "Sending M-Pesa prompt..." : "Pay with M-Pesa"}
      </button>
    </div>
  );
}

function paypalEnvironment() {
  const configured = String(
    import.meta.env.VITE_PAYPAL_ENVIRONMENT || "sandbox",
  )
    .trim()
    .toLowerCase();

  if (configured === "live") return "production";
  if (["sandbox", "production"].includes(configured)) return configured;
  return null;
}

function PayPalButtons({ blocked, createOrder, captureOrder, onCancel, onError }) {
  const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
  const environment = paypalEnvironment();

  if (!clientId || !environment) {
    return (
      <p role="alert" className="rounded-md bg-error-container/40 p-3 text-error">
        PayPal is not configured for this storefront.
      </p>
    );
  }

  return (
    <PayPalProvider
      clientId={clientId}
      environment={environment}
      components={["paypal-payments"]}
      pageType="checkout"
    >
      <PayPalOneTimePaymentButton
        disabled={Boolean(blocked)}
        createOrder={createOrder}
        onApprove={captureOrder}
        onCancel={onCancel}
        onError={onError}
      />
    </PayPalProvider>
  );
}

function PaymentAction({
  provider,
  blocked,
  phase,
  mpesaPhone,
  setMpesaPhone,
  startStripe,
  startMpesa,
  createPayPalOrder,
  capturePayPalOrder,
  cancelPayPal,
  resetPhase,
}) {
  if (provider === "stripe") {
    return (
      <button disabled={Boolean(blocked)} onClick={startStripe} className={`${primaryClass} w-full`}>
        {phase === "submitting"
          ? "Preparing checkout..."
          : phase === "redirecting"
            ? "Redirecting to Stripe..."
            : "Continue to Stripe"}
      </button>
    );
  }

  if (provider === "mpesa") {
    return (
      <MpesaPaymentForm
        phone={mpesaPhone}
        setPhone={setMpesaPhone}
        blocked={blocked}
        phase={phase}
        onSubmit={startMpesa}
      />
    );
  }

  return (
    <PayPalButtons
      blocked={blocked}
      createOrder={createPayPalOrder}
      captureOrder={capturePayPalOrder}
      onCancel={cancelPayPal}
      onError={resetPhase}
    />
  );
}

function PurchaseSummary({ items, subtotal, busy, children }) {
  return (
    <aside className={`${panelClass} lg:sticky lg:top-28 lg:col-span-4`}>
      <h2 className="border-b border-outline-variant pb-4 text-xl font-semibold">
        Purchase Summary
      </h2>
      <div className="flex justify-between gap-3 py-4 text-sm">
        <span>Items</span>
        <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-outline-variant py-5">
        <span className="font-semibold">Estimated total</span>
        <strong className="text-2xl text-primary">{paymentMoney(subtotal)}</strong>
      </div>
      <p className="mb-5 text-sm text-outline">
        Prices and stock are checked again when checkout starts. Review the final
        amount with your selected payment provider before paying.
      </p>
      {children}
      {busy && (
        <p role="status" className="mt-3 text-sm">
          Please wait while we open your payment session.
        </p>
      )}
      <p className="mt-4 text-sm text-outline">
        You'll return to FastStore after completing payment.
      </p>
    </aside>
  );
}

function CheckoutForm() {
  const { session, invalidateSession, refreshShopping } = useStore();
  const navigate = useNavigate();
  const addresses = useCustomerResource("/address/user");
  const cart = useCustomerResource("/cart/user");
  const savedAttempt = readCheckoutAttempt(session.user);

  const [selectedAddress, setSelectedAddress] = useState("");
  const [attempt, setAttempt] = useState(() => savedAttempt);
  const [provider, setProvider] = useState(() => savedAttempt?.provider || "stripe");
  const [error, setError] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [phase, setPhase] = useState("idle");

  const locked = useRef(false);
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    function restorePage(event) {
      if (event.persisted) {
        locked.current = false;
        setPhase("idle");
      }
    }
    window.addEventListener("pageshow", restorePage);
    return () => {
      window.removeEventListener("pageshow", restorePage);
      active.current = false;
    };
  }, []);

  const savedAddresses = addresses.data || [];
  const addressId = selectedAddressId(attempt, selectedAddress, savedAddresses);
  const items = attempt?.displayItems || cart.data?.products || [];
  const subtotal = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  ) / 100;

  const loading = addresses.loading || cart.loading;
  const busy = phase !== "idle";
  const unavailable = items.some((item) => item.available === false);
  const blocked =
    busy ||
    (!attempt &&
      (loading || addresses.error || cart.error || !items.length || !addressId || unavailable));

  function resetPaymentLock() {
    locked.current = false;
  }

  function showFailure(failure, purchase) {
    if (!active.current) return;

    if ([401, 403].includes(failure.response?.status)) {
      invalidateSession();
      return;
    }

    if (isRejectedPurchase(failure) && purchase) {
      clearCheckoutAttempt(session.user, purchase.key);
      setAttempt(null);
      cart.retry();
      addresses.retry();
    }

    setError(failure.response || failure.isAxiosError ? errorMessage(failure) : failure.message);
    setPhase("idle");
    resetPaymentLock();
  }

  function selectProvider(nextProvider) {
    if (locked.current || busy || nextProvider === provider) return;
    if (attempt) {
      const { alternatives = {}, ...current } = attempt;
      const saved = { ...alternatives, [current.provider || "stripe"]: current };
      const next = saved[nextProvider] || {
        ...checkoutAttempt(nextProvider, addressId, items),
        body: attempt.body,
      };
      const purchase = { ...next, alternatives: saved };
      try {
        saveCheckoutAttempt(session.user, purchase);
      } catch {
        setError("Unable to save your payment selection. Please try again.");
        return;
      }
      setAttempt(purchase);
    }
    setProvider(nextProvider);
    setError("");
  }

  function getOrCreateAttempt(nextProvider) {
    const purchase = attempt || checkoutAttempt(nextProvider, addressId, items);

    if ((purchase.provider || "stripe") !== nextProvider) {
      throw new Error("This saved checkout is already using another payment method.");
    }

    if (!attempt) {
      // The checkout key must be saved before the network request. If the tab
      // reloads or the response is lost, the same reserved order can be reused.
      saveCheckoutAttempt(session.user, purchase);
      setAttempt(purchase);
    }

    return purchase;
  }

  async function startStripeCheckout() {
    if (locked.current || blocked) return;
    locked.current = true;
    setError("");
    setPhase("submitting");

    let purchase;
    try {
      purchase = getOrCreateAttempt("stripe");
      const { data } = await customerRequest({
        method: "post",
        url: "/checkout/create-checkout-session",
        headers: { "Idempotency-Key": purchase.key },
        data: purchase.body,
      });
      if (!active.current) return;

      setPhase("redirecting");
      window.location.assign(assertStripeCheckoutUrl(data.url).href);
    } catch (failure) {
      showFailure(failure, purchase);
    }
  }

  async function createPayPalOrder() {
    setError("");
    setPhase("submitting");

    try {
      const purchase = getOrCreateAttempt("paypal");
      const { data } = await customerRequest({
        method: "post",
        url: "/checkout/paypal/orders",
        headers: { "Idempotency-Key": purchase.key },
        data: purchase.body,
      });
      setPhase("idle");
      return { orderId: data.id };
    } catch (failure) {
      setPhase("idle");
      setError(failure.response || failure.isAxiosError ? errorMessage(failure) : failure.message);
      throw failure;
    }
  }

  async function capturePayPalOrder({ orderId }) {
    setPhase("submitting");
    try {
      const { data } = await customerRequest({
        method: "post",
        url: `/checkout/paypal/orders/${encodeURIComponent(orderId)}/capture`,
      });
      clearCheckoutAttempt(session.user, attempt?.key);
      await refreshShopping();
      navigate(`/payment-result?order_id=${encodeURIComponent(data.orderId)}`);
    } catch (failure) {
      setPhase("idle");
      setError(errorMessage(failure));
      throw failure;
    }
  }

  async function startMpesaPayment() {
    if (locked.current || blocked) return;
    locked.current = true;
    setError("");
    setPhase("submitting");

    let purchase;
    try {
      purchase = getOrCreateAttempt("mpesa");
      const { data } = await customerRequest({
        method: "post",
        url: "/checkout/mpesa/stk-push",
        headers: { "Idempotency-Key": purchase.key },
        data: { ...purchase.body, phoneNumber: mpesaPhone },
      });
      await refreshShopping();
      navigate(`/payment-result?order_id=${encodeURIComponent(data.orderId)}`);
    } catch (failure) {
      showFailure(failure, purchase);
    }
  }

  function cancelPayPal() {
    setPhase("idle");
    setError("PayPal checkout was cancelled. Your reserved checkout can be retried.");
  }

  return (
    <>
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      <SavedAttemptNotice attempt={attempt} />
      <ErrorMessage message={error} />

      <div className="grid items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <ShippingSection
            addresses={addresses}
            addressId={addressId}
            attempt={attempt}
            busy={busy}
            loading={loading}
            selectedAddress={addressId}
            onAddressChange={setSelectedAddress}
          />
          <PaymentMethodSection
            provider={provider}
            setProvider={selectProvider}
            busy={busy}
          />
          <ReviewSection
            attempt={attempt}
            cart={cart}
            items={items}
            loading={loading}
            unavailable={unavailable}
          />
        </div>

        <PurchaseSummary items={items} subtotal={subtotal} busy={busy}>
          <PaymentAction
            provider={provider}
            blocked={blocked}
            phase={phase}
            mpesaPhone={mpesaPhone}
            setMpesaPhone={setMpesaPhone}
            startStripe={startStripeCheckout}
            startMpesa={startMpesaPayment}
            createPayPalOrder={createPayPalOrder}
            capturePayPalOrder={capturePayPalOrder}
            cancelPayPal={cancelPayPal}
            resetPhase={() => setPhase("idle")}
          />
        </PurchaseSummary>
      </div>
    </>
  );
}

export default function Checkout() {
  const { session } = useStore();

  useEffect(() => {
    document.title = "Checkout | FastStore";
  }, []);

  return (
    <CheckoutLayout title="Checkout">
      <AccountRequired>
        <CheckoutForm key={session.user?._id || session.user?.email} />
      </AccountRequired>
    </CheckoutLayout>
  );
}
