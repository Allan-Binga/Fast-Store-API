import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { customerRequest, errorMessage } from "../api";
import CheckoutLayout, {
  AccountRequired,
  panelClass,
  primaryClass,
  secondaryClass,
} from "../components/checkout/CheckoutLayout";
import Skeleton from "../components/Skeleton";
import OrderDetails from "../components/checkout/OrderDetails";
import { clearCheckoutAttempt } from "../store/checkout";
import { useStore } from "../store/context";

const PAYMENT_REFERENCE_RULES = {
  session_id: /^cs_[a-zA-Z0-9_]{1,240}$/,
  order_id: /^[a-f\d]{24}$/i,
  checkout_key: /^[a-zA-Z0-9_-]{16,100}$/,
};

const STATUS_COPY = {
  checking: {
    title: "Checking your payment",
    message: "Please wait while we retrieve your payment status.",
    icon: "hourglass_top",
    color: "bg-blue-50 text-blue-700",
  },
  paid: {
    title: "Payment confirmed & order placed!",
    message: "Your payment is confirmed and delivery is requested. We will email you when the store initiates delivery. Your order details are below.",
    icon: "check_circle",
    color: "bg-emerald-100 text-emerald-700",
  },
  partially_refunded: {
    title: "Order partially refunded",
    message:
      "Part of this payment has been refunded. View your refund history for details.",
    icon: "currency_exchange",
    color: "bg-blue-100 text-blue-700",
  },
  refunded: {
    title: "Order refunded",
    message:
      "This payment has been refunded. View your refund history for details.",
    icon: "assignment_return",
    color: "bg-surface-container-high text-on-surface-variant",
  },
  pending: {
    title: "Payment confirmation pending",
    message:
      "We have not confirmed payment. You can return to the same reserved checkout and try another payment method.",
    icon: "schedule",
    color: "bg-amber-50 text-amber-700",
  },
  expired: {
    title: "Checkout expired",
    message:
      "This checkout expired without a confirmed payment. Return to your cart to review your items.",
    icon: "timer_off",
    color: "bg-orange-50 text-orange-700",
  },
  unavailable: {
    title: "Payment status unavailable",
    message:
      "We could not confirm this payment. Check the status again before starting another payment.",
    icon: "error_outline",
    color: "bg-error-container/30 text-error",
  },
};

function providerName(provider) {
  if (provider === "wallet") return "Wallet";
  if (provider === "paypal") return "PayPal";
  if (provider === "mpesa") return "M-Pesa";
  return "Stripe";
}

function resultStatus(order, isCurrentResult) {
  if (!isCurrentResult) return "checking";
  if (["paid", "partially_refunded", "refunded", "pending", "expired"].includes(
      order?.paymentStatus,
    )) {
    return order.paymentStatus;
  }
  return "unavailable";
}

function paymentReference(params) {
  const keys = Object.keys(PAYMENT_REFERENCE_RULES);
  const provided = keys.filter((key) => params.has(key));
  const key = provided[0];
  const value = params.get(key) || "";
  const valid =
    provided.length === 1 &&
    params.getAll(key).length === 1 &&
    PAYMENT_REFERENCE_RULES[key].test(value);

  return {
    valid,
    query: valid ? new URLSearchParams({ [key]: value }).toString() : "",
  };
}

function StatusIcon({ copy }) {
  return (
    <div
      className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full ${copy.color}`}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-4xl">
        {copy.icon}
      </span>
    </div>
  );
}

function StatusHeader({ status, cancelled, copy, order, result, retryError }) {
  return (
    <div className="border-b border-outline-variant/60 pb-8 text-center">
      <StatusIcon copy={copy} />
      <h1 className="mb-3 text-3xl font-bold">
        {cancelled && status === "pending" ? "You returned from checkout" : copy.title}
      </h1>
      <p role="status" className="mx-auto max-w-xl text-on-surface-variant">
        {status === "paid" && order?.fulfillmentStatus === "initiated" ? "Your payment is confirmed and delivery has started. Track its progress in your account." : status === "paid" && order?.fulfillmentStatus === "delivered" ? "Your payment is confirmed and this order has been delivered." : copy.message}
      </p>
      {result?.error && (
        <p role="alert" className="mt-3 text-error">
          {result.error}
        </p>
      )}
      {result?.polling && (
        <p className="mt-3 text-sm text-outline">Checking for an update automatically...</p>
      )}
      {status === "pending" && order?.expiresAt && (
        <p className="mt-3 text-sm text-outline">
          This checkout and its stock reservation are available until{" "}
          {new Date(order.expiresAt).toLocaleString()}.
        </p>
      )}
      {retryError && (
        <p role="alert" className="mt-3 text-error">
          {retryError}
        </p>
      )}
      {order && <OrderBadges order={order} />}
    </div>
  );
}

function OrderBadges({ order }) {
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-3 text-xs">
      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-2 text-indigo-700">
        Payment provider: {providerName(order.provider)}
      </span>
      <span className="max-w-full break-all rounded-full border border-outline-variant px-3 py-2">
        Order reference: {order._id}
      </span>
      {order.createdAt && (
        <span className="rounded-full border border-outline-variant px-3 py-2">
          {new Date(order.createdAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

function StatusActions({ status, order, retrying, retryPayment, retryStatus }) {
  return (
    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {status === "pending" && order && (
        <button disabled={retrying} onClick={retryPayment} className={primaryClass}>
          {retrying ? `Opening ${providerName(order.provider)}...` : "Retry payment"}
        </button>
      )}
      {status === "unavailable" && (
        <button onClick={retryStatus} className={primaryClass}>
          Try loading payment status again
        </button>
      )}
      {["expired", "pending"].includes(status) && (
        <Link to="/cart" className={secondaryClass}>
          Return to cart
        </Link>
      )}
      {["paid", "partially_refunded", "refunded"].includes(status) && (
        <>
          <Link to={order?._id ? `/deliveries?orderId=${encodeURIComponent(order._id)}` : "/deliveries"} className={primaryClass}>
            Track delivery
          </Link>
          <Link to="/orders" className={secondaryClass}>
            View orders
          </Link>
        </>
      )}
      <Link to="/" className={secondaryClass}>
        Continue shopping
      </Link>
    </div>
  );
}

function InvalidReference() {
  return (
    <section className={`${panelClass} mx-auto max-w-lg space-y-4 text-center`}>
      <h1 className="text-2xl font-semibold">Payment reference missing or invalid</h1>
      <p>Open the link from your checkout or find your purchase in your orders.</p>
      <Link to="/orders" className={primaryClass}>
        View orders
      </Link>
    </section>
  );
}

function PaymentStatus({ query, cancelled }) {
  const { session, invalidateSession, refreshShopping } = useStore();
  const navigate = useNavigate();
  const refreshedOrder = useRef(null);

  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState("");

  const isCurrentResult = result?.attempt === attempt;
  const order = isCurrentResult ? result.order : null;
  const status = resultStatus(order, isCurrentResult);
  const copy = STATUS_COPY[status];

  useEffect(() => {
    const controller = new AbortController();
    let timer;
    let checks = 0;

    async function checkPayment() {
      try {
        const { data } = await customerRequest({
          url: `/orders/payment-status?${query}`,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        checks += 1;
        const polling = data.paymentStatus === "pending" && checks < 8 && !cancelled;
        setResult({ attempt, order: data, polling });
        setRetryError("");

        // Payment providers can confirm asynchronously. Once the backend marks
        // the order final, the saved checkout key should no longer be reused.
        if (["paid", "expired"].includes(data.paymentStatus)) {
          clearCheckoutAttempt(session.user, data.checkoutKey);
        }

        if (data.paymentStatus === "paid" && refreshedOrder.current !== data._id) {
          refreshedOrder.current = data._id;
          void refreshShopping();
        }

        if (polling) timer = window.setTimeout(checkPayment, 3000);
      } catch (error) {
        if (controller.signal.aborted) return;
        if ([401, 403].includes(error.response?.status)) {
          invalidateSession();
          return;
        }
        setResult({ attempt, error: errorMessage(error), polling: false });
      }
    }

    void checkPayment();
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, attempt, cancelled, session.user, invalidateSession, refreshShopping]);

  async function retryPayment() {
    if (!order || retrying) return;

    setRetrying(true);
    setRetryError("");

    if (["paypal", "mpesa", "wallet"].includes(order.provider)) {
      navigate("/checkout");
      return;
    }

    try {
      const { data } = await customerRequest({
        method: "post",
        url: "/checkout/resume-checkout-session",
        data: { orderId: order._id },
      });
      const destination = new URL(data.url);

      if (destination.protocol !== "https:" || destination.hostname !== "checkout.stripe.com") {
        throw new Error("Stripe returned an invalid payment link.");
      }

      window.location.assign(destination.href);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        invalidateSession();
        return;
      }

      const paymentStatus = error.response?.data?.paymentStatus;
      if (["paid", "expired"].includes(paymentStatus)) {
        setResult({ attempt, order: { ...order, paymentStatus }, polling: false });
        clearCheckoutAttempt(session.user, order.checkoutKey);
        if (paymentStatus === "paid") void refreshShopping();
      }

      setRetryError(error.response || error.isAxiosError ? errorMessage(error) : error.message);
      setRetrying(false);
    }
  }

  return (
    <section className={`${panelClass} mx-auto max-w-3xl`}>
      <StatusHeader
        status={status}
        cancelled={cancelled}
        copy={copy}
        order={order}
        result={isCurrentResult ? result : null}
        retryError={retryError}
      />
      {status === "checking" && <div className="py-6"><Skeleton count={1} label="Loading payment and order details" /></div>}
      {order && (
        <div className="py-6">
          <OrderDetails order={order} />
        </div>
      )}
      <StatusActions
        status={status}
        order={order}
        retrying={retrying}
        retryPayment={retryPayment}
        retryStatus={() => setAttempt((value) => value + 1)}
      />
    </section>
  );
}

export default function PaymentResult() {
  const [params] = useSearchParams();
  const { session } = useStore();
  const reference = paymentReference(params);

  useEffect(() => {
    document.title = "Payment result | FastStore";
  }, []);

  return (
    <CheckoutLayout title="Payment result">
      <AccountRequired>
        {reference.valid ? (
          <PaymentStatus
            key={`${session.user?._id || session.user?.email}:${reference.query}`}
            query={reference.query}
            cancelled={params.get("cancelled") === "1"}
          />
        ) : (
          <InvalidReference />
        )}
      </AccountRequired>
    </CheckoutLayout>
  );
}
