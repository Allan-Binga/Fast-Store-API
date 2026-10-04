import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "../components/Skeleton";
import CustomerAccountNav from "../components/CustomerAccountNav";
import OrderStatusBadge from "../components/OrderStatusBadge";
import CheckoutLayout, {
  AccountRequired,
  panelClass,
  primaryClass,
  secondaryClass,
} from "../components/checkout/CheckoutLayout";
import useCustomerResource from "../hooks/useCustomerResource";
import { paymentMoney } from "../store/checkout";
import { useStore } from "../store/context";

function providerName(provider) {
  if (provider === "wallet") return "Wallet";
  if (provider === "paypal") return "PayPal";
  if (provider === "mpesa") return "M-Pesa";
  return "Stripe";
}

function canRequestRefund(order) {
  const available =
    order.totalAmount -
    (order.refundedAmount || 0) -
    (order.refundPendingAmount || 0);

  return (
    ["stripe", "paypal", "wallet"].includes(order.paymentProvider) &&
    ["paid", "partially_refunded"].includes(order.paymentStatus) &&
    available > 0
  );
}

function OrderHistory() {
  const [page, setPage] = useState(1);
  const orders = useCustomerResource(`/orders/user?limit=10&page=${page}`);

  return (
    <>
      <CustomerAccountNav />
      <section className={`${panelClass} mx-auto max-w-4xl`}>
        <header className="mb-6 border-b border-outline-variant/60 pb-5">
          <h1 className="text-3xl font-bold">Your orders</h1>
          <p className="mt-2 text-on-surface-variant">
            Review payments, follow fulfillment, and open delivery or refund actions.
          </p>
        </header>

        {orders.loading && <Skeleton count={3} label="Loading orders" />}
        {orders.error && (
          <div role="alert" className="space-y-4">
            <p className="text-error">{orders.error}</p>
            <button onClick={orders.retry} className={secondaryClass}>
              Try again
            </button>
          </div>
        )}
        {orders.data?.length === 0 && (
          <div className="rounded-sm border border-dashed border-outline-variant p-8 text-center">
            <h2 className="text-xl font-semibold">No orders on this page</h2>
            <Link to="/" className={`${primaryClass} mt-4`}>
              Start shopping
            </Link>
          </div>
        )}

        <div className="space-y-5">
          {orders.data?.map((order) => (
            <article
              key={order._id}
              className="space-y-4 rounded-md border border-outline-variant bg-white p-5  sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-outline">
                    Order reference
                  </p>
                  <h2 className="break-all font-semibold">{order._id}</h2>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    {new Date(order.createdAt).toLocaleDateString()} ·{" "}
                    {providerName(order.paymentProvider)}
                  </p>
                </div>
                <strong className="text-xl text-primary">
                  {paymentMoney(order.totalAmount, order.currency)}
                </strong>
              </div>

              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge status={order.paymentStatus} label="Payment" />
                <OrderStatusBadge
                  status={["paid", "partially_refunded"].includes(order.paymentStatus) && (!order.fulfillmentStatus || order.fulfillmentStatus === "unfulfilled") ? "requested" : order.fulfillmentStatus || "unfulfilled"}
                  label="Delivery"
                />
              </div>

              <p className="text-sm text-on-surface-variant">
                {order.items?.length || 0} item
                {order.items?.length === 1 ? "" : "s"}
                {order.refundPendingAmount > 0 && (
                  <> · {paymentMoney(order.refundPendingAmount, order.currency)} under refund review</>
                )}
              </p>

              <div className="flex flex-wrap gap-3 border-t border-outline-variant/60 pt-4">
                <Link
                  to={`/payment-result?order_id=${encodeURIComponent(order._id)}`}
                  className={secondaryClass}
                >
                  Order details
                </Link>
                {["paid", "partially_refunded", "refunded"].includes(
                  order.paymentStatus,
                ) && (
                  <Link to={`/deliveries?orderId=${encodeURIComponent(order._id)}`} className={secondaryClass}>
                    Track delivery
                  </Link>
                )}
                {canRequestRefund(order) && (
                  <Link
                    to={`/refunds?${new URLSearchParams({ orderId: order._id })}`}
                    className="inline-flex min-h-11 items-center justify-center px-2 font-semibold text-primary hover:underline"
                  >
                    Request refund
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            disabled={page === 1 || orders.loading}
            onClick={() => setPage((value) => value - 1)}
            className={secondaryClass}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={orders.loading || orders.data?.length !== 10}
            onClick={() => setPage((value) => value + 1)}
            className={secondaryClass}
          >
            Next
          </button>
        </div>
      </section>
    </>
  );
}

export default function Orders() {
  const { session } = useStore();

  useEffect(() => {
    document.title = "Your orders | FastStore";
  }, []);

  return (
    <CheckoutLayout title="Your orders">
      <AccountRequired>
        <OrderHistory key={session.user?._id || session.user?.email} />
      </AccountRequired>
    </CheckoutLayout>
  );
}
