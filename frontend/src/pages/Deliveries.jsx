import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { customerRequest, errorMessage } from "../api";
import CustomerAccountNav from "../components/CustomerAccountNav";
import Modal from "../components/Modal";
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

function deliveryDate(delivery) {
  if (delivery.status === "delivered" && delivery.deliveredAt) {
    return `Delivered ${new Date(delivery.deliveredAt).toLocaleString()}`;
  }

  if (delivery.estimatedDeliveryAt) {
    return `Estimated arrival ${new Date(
      delivery.estimatedDeliveryAt,
    ).toLocaleString()}`;
  }

  return "An estimated arrival has not been added yet.";
}

function DeliveryTimeline({ delivery }) {
  const delivered = delivery.status === "delivered";

  return (
    <ol className="grid gap-3 text-sm sm:grid-cols-2" aria-label="Delivery progress">
      <li className="flex gap-3 rounded-sm bg-surface-container-low p-3">
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-[20px] text-primary"
        >
          check_circle
        </span>
        <span>
          <strong className="block">Delivery initiated</strong>
          {new Date(delivery.initiatedAt || delivery.createdAt).toLocaleString()}
        </span>
      </li>
      <li
        className={`flex gap-3 rounded-sm p-3 ${
          delivered
            ? "bg-emerald-50 text-emerald-900"
            : "border border-dashed border-outline-variant text-on-surface-variant"
        }`}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
          {delivered ? "task_alt" : "radio_button_unchecked"}
        </span>
        <span>
          <strong className="block">Customer confirmation</strong>
          {delivered
            ? new Date(
                delivery.confirmedByCustomerAt || delivery.deliveredAt,
              ).toLocaleString()
            : "Waiting for you to confirm receipt"}
        </span>
      </li>
    </ol>
  );
}


function DeliverySkeleton() {
  return (
    <div role="status" aria-label="Loading deliveries" className="space-y-5">
      <span className="sr-only">Loading deliveries…</span>
      {[0, 1].map((item) => (
        <div
          key={item}
          aria-hidden="true"
          className="animate-pulse space-y-5 rounded-md border border-outline-variant bg-white p-5 sm:p-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-20 rounded-full bg-surface-container-high" />
              <div className="h-5 w-3/4 max-w-sm rounded-full bg-surface-container-high" />
              <div className="h-4 w-40 rounded-full bg-surface-container" />
            </div>
            <div className="h-7 w-24 rounded-full bg-surface-container-high" />
          </div>
          <div className="h-5 w-52 rounded-full bg-surface-container-high" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="h-20 rounded-sm bg-surface-container-low" />
            <div className="h-20 rounded-sm bg-surface-container-low" />
          </div>
          <div className="h-11 w-40 rounded-sm bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}

function DeliveryList() {
  const { invalidateSession } = useStore();
  const deliveries = useCustomerResource("/deliveries/user?limit=50&page=1");
  const orders = useCustomerResource("/orders/user?limit=100&page=1");
  const [confirming, setConfirming] = useState(null);
  const [pendingId, setPendingId] = useState("");
  const [feedback, setFeedback] = useState(null);

  const ordersById = useMemo(
    () =>
      new Map(
        (orders.data || []).map((order) => [String(order._id), order]),
      ),
    [orders.data],
  );

  async function confirmDelivery() {
    if (!confirming || pendingId) return;

    setPendingId(confirming._id);
    setFeedback(null);

    try {
      await customerRequest({
        method: "post",
        url: `/deliveries/${encodeURIComponent(confirming._id)}/confirm`,
      });
      setConfirming(null);
      setFeedback({ type: "success", message: "Delivery confirmed. Thank you." });
      deliveries.retry();
      orders.retry();
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        invalidateSession();
        return;
      }
      setFeedback({ type: "error", message: errorMessage(error) });
    } finally {
      setPendingId("");
    }
  }

  return (
    <>
      <CustomerAccountNav />
      <section className={`${panelClass} mx-auto min-h-[40rem] max-w-4xl`}>
        <header className="mb-6 border-b border-outline-variant/60 pb-5">
          <h1 className="text-3xl font-bold">Your deliveries</h1>
          <p className="mt-2 text-on-surface-variant">
            Follow deliveries started by the store and confirm when your order arrives.
          </p>
        </header>

        {feedback && (
          <p
            role={feedback.type === "error" ? "alert" : "status"}
            className={`mb-5 rounded-sm border p-4 ${
              feedback.type === "error"
                ? "border-error/30 bg-error-container/40 text-error"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {feedback.message}
          </p>
        )}

        {deliveries.loading && <DeliverySkeleton />}
        {deliveries.error && (
          <div role="alert" className="space-y-3 text-error">
            <p>{deliveries.error}</p>
            <button onClick={deliveries.retry} className={secondaryClass}>
              Try again
            </button>
          </div>
        )}

        {!deliveries.loading && !deliveries.error && !deliveries.data?.length && (
          <div className="rounded-md border border-dashed border-outline-variant p-8 text-center">
            <span
              aria-hidden="true"
              className="material-symbols-outlined mb-3 text-4xl text-outline"
            >
              local_shipping
            </span>
            <h2 className="text-xl font-semibold">No active deliveries yet</h2>
            <p className="mx-auto mt-2 max-w-xl text-on-surface-variant">
              Paid orders appear here after an administrator initiates delivery.
            </p>
            <Link to="/orders" className={`${primaryClass} mt-5`}>
              View your orders
            </Link>
          </div>
        )}

        <div className="space-y-5">
          {deliveries.data?.map((delivery) => {
            const order = ordersById.get(String(delivery.order));

            return (
              <article
                key={delivery._id}
                className="space-y-4 rounded-md border border-outline-variant bg-white p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-outline">
                      Order
                    </p>
                    <h2 className="break-all font-semibold">{delivery.order}</h2>
                    {order && (
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {order.items?.length || 0} item
                        {order.items?.length === 1 ? "" : "s"} ·{" "}
                        {paymentMoney(order.totalAmount, order.currency)}
                      </p>
                    )}
                  </div>
                  <OrderStatusBadge status={delivery.status} />
                </div>

                <p className="font-medium">{deliveryDate(delivery)}</p>
                {delivery.note && (
                  <p className="rounded-sm bg-surface-container-low p-3 text-sm">
                    <strong>Delivery note:</strong> {delivery.note}
                  </p>
                )}
                <DeliveryTimeline delivery={delivery} />

                <div className="flex flex-wrap gap-3 border-t border-outline-variant/60 pt-4">
                  {delivery.status === "initiated" && (
                    <button
                      type="button"
                      disabled={pendingId === delivery._id}
                      onClick={() => {
                        setFeedback(null);
                        setConfirming(delivery);
                      }}
                      className={primaryClass}
                    >
                      {pendingId === delivery._id
                        ? "Confirming…"
                        : "Confirm delivery"}
                    </button>
                  )}
                  <Link
                    to={`/payment-result?order_id=${encodeURIComponent(
                      delivery.order,
                    )}`}
                    className={secondaryClass}
                  >
                    View order
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {confirming && (
        <Modal
          title="Confirm delivery"
          onClose={(event) => {
            if (pendingId) {
              event?.preventDefault();
              return;
            }
            setConfirming(null);
          }}
        >
          <div className="space-y-5">
            <p>
              Confirm that you have received order{" "}
              <strong className="break-all">{confirming.order}</strong>.
            </p>
            <p className="rounded-sm bg-surface-container-low p-4 text-sm text-on-surface-variant">
              This marks the delivery and order as delivered. Only confirm after the
              package is in your possession.
            </p>
            {feedback?.type === "error" && (
              <p role="alert" className="rounded-sm bg-error-container/40 p-3 text-error">
                {feedback.message}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(pendingId)}
                onClick={() => setConfirming(null)}
                className={secondaryClass}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(pendingId)}
                onClick={confirmDelivery}
                className={primaryClass}
              >
                {pendingId ? "Confirming…" : "Yes, I received it"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default function Deliveries() {
  const { session } = useStore();

  useEffect(() => {
    document.title = "Your deliveries | FastStore";
  }, []);

  return (
    <CheckoutLayout title="Your deliveries">
      <AccountRequired>
        <DeliveryList key={session.user?._id || session.user?.email} />
      </AccountRequired>
    </CheckoutLayout>
  );
}
