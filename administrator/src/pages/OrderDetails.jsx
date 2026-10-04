import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { CalendarInput } from "../components/FormControls";
import Modal from "../components/Modal";
import {
  Button,
  Card,
  Empty,
  Field,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  inputClass,
  money,
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliveryOpen, setDeliveryOpen] = useState(false);
  const [reject, setReject] = useState(null);
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const orderResult = await adminApi.get(`/orders/${orderId}`);
      const order = orderResult.data;
      const [deliveries, refunds, transactions, customerResult] =
        await Promise.all([
          adminApi.get("/deliveries", { params: { orderId } }),
          adminApi.get("/refunds", { params: { orderId } }),
          adminApi.get("/payment-transactions", { params: { orderId } }),
          adminApi.get(`/users/${order.user}`),
        ]);

      setData({
        order,
        delivery: deliveries.data[0],
        refunds: refunds.data,
        transactions: transactions.data,
        customer: customerResult.data,
      });
    } catch (e) {
      notify(errorMessage(e, "Unable to load order."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [orderId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function approve(item) {
    if (
      !window.confirm(
        `Approve the ${money(item.amount, item.currency)} refund to ${item.destination === "wallet" || item.provider === "wallet" ? "the customer wallet" : item.provider}?`,
      )
    )
      return;
    try {
      await adminApi.post(`/refunds/${item._id}/approve`);
      notify("Refund processed.");
      load();
    } catch (e) {
      notify(errorMessage(e), "error");
    }
  }
  if (loading)
    return (
      <Card>
        <SkeletonRows rows={8} />
      </Card>
    );
  if (!data)
    return (
      <Card>
        <Empty icon="error" title="Order could not be loaded" />
      </Card>
    );
  const { order, delivery, refunds, transactions, customer } = data;
  const canDeliver =
    ["paid", "partially_refunded"].includes(order.paymentStatus) &&
    ["unfulfilled", "requested"].includes(order.fulfillmentStatus);
  const address = order.shippingAddress || {};
  return (
    <>
      <div className="mb-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-sm font-bold text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Back to orders
        </Link>
      </div>
      <PageHeader
        eyebrow="Order record"
        title={`Order #${order._id.slice(-8).toUpperCase()}`}
        description={`Placed ${shortDate(order.createdAt)} · ${order.items?.length || 0} line items`}
      >
        {canDeliver && (
          <Button onClick={() => setDeliveryOpen(true)}>
            <span className="material-symbols-outlined text-[19px]">
              local_shipping
            </span>
            Initiate delivery
          </Button>
        )}
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <Card>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="font-bold">Purchased items</h2>
              <div className="flex gap-2">
                <StatusBadge value={order.paymentStatus} />
                <StatusBadge value={order.fulfillmentStatus} />
              </div>
            </header>
            <div className="divide-y divide-line">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex gap-4 p-5"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="size-20 rounded-xl bg-slate-100 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      Product {String(item.productId).slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm">
                      {item.quantity} × {money(item.price, order.currency)}
                    </p>
                  </div>
                  <strong>
                    {money(item.price * item.quantity, order.currency)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="border-t border-line bg-slate-50 p-5">
              <div className="ml-auto max-w-xs space-y-2 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Refunded</span>
                  <span>{money(order.refundedAmount, order.currency)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Refund pending</span>
                  <span>
                    {money(order.refundPendingAmount, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-base font-extrabold">
                  <span>Order total</span>
                  <span>{money(order.totalAmount, order.currency)}</span>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Payment activity</h2>
            </header>
            {transactions.length ? (
              <div className="divide-y divide-line">
                {transactions.map((item) => (
                  <div
                    key={item._id}
                    className="grid gap-2 p-5 text-sm sm:grid-cols-4 sm:items-center"
                  >
                    <div>
                      <p className="font-bold capitalize">{item.type}</p>
                      <p className="text-xs uppercase text-muted">
                        {item.provider}
                      </p>
                    </div>
                    <strong>{money(item.amount, item.currency)}</strong>
                    <StatusBadge value={item.status} />
                    <p className="text-right text-xs text-muted">
                      {shortDate(item.occurredAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                icon="payments"
                title="No transaction ledger entries"
                text="Provider references are still shown in the order summary."
              />
            )}
          </Card>
          <Card>
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Refund requests</h2>
            </header>
            {refunds.length ? (
              <div className="divide-y divide-line">
                {refunds.map((item) => (
                  <div key={item._id} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold">
                          {money(item.amount, item.currency)} ·{" "}
                          {item.reason.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          Requested {shortDate(item.createdAt)}
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    {item.customerExplanation && (
                      <p className="mt-3 text-sm text-muted">
                        {item.customerExplanation}
                      </p>
                    )}
                    {item.evidenceImages?.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        {item.evidenceImages.map((src, i) => (
                          <a
                            key={src}
                            href={src}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={src}
                              alt={`Evidence ${i + 1}`}
                              className="size-24 rounded-xl border border-line object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    {item.status === "requested" && (
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => approve(item)}>Approve</Button>
                        <Button
                          variant="secondary"
                          onClick={() => setReject(item)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty icon="currency_exchange" title="No refund requests" />
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Customer</h2>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
              <p className="font-bold">
                {customer
                  ? `${customer.firstName} ${customer.lastName}`
                  : "Customer record"}
              </p>
              <p className="mt-1 text-muted">
                {customer?.email || String(order.user)}
              </p>
              <p className="text-muted">{customer?.phone}</p>
            </div>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Shipping address</h2>
            {Object.keys(address).length ? (
              <div className="mt-4 space-y-1 text-sm text-muted">
                {Object.entries(address)
                  .filter(([, value]) => value && typeof value !== "object")
                  .map(([key, value]) => (
                    <p key={key}>
                      <span className="capitalize">
                        {key.replaceAll(/([A-Z])/g, " $1")}:{" "}
                      </span>
                      <strong className="text-ink">{value}</strong>
                    </p>
                  ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                No shipping address snapshot.
              </p>
            )}
          </Card>
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Delivery</h2>
              <StatusBadge
                value={delivery?.status || order.fulfillmentStatus}
              />
            </div>
            {delivery?.status === "requested" ? <p className="mt-3 text-sm text-muted">Payment confirmed. This delivery is requested and awaiting initiation.</p> : delivery ? (
              <div className="mt-4 space-y-2 text-sm text-muted">
                <p>
                  Initiated:{" "}
                  <strong className="text-ink">
                    {shortDate(delivery.initiatedAt)}
                  </strong>
                </p>
                <p>
                  Estimated:{" "}
                  <strong className="text-ink">
                    {shortDate(delivery.estimatedDeliveryAt)}
                  </strong>
                </p>
                {delivery.note && (
                  <p className="rounded-xl bg-slate-50 p-3">{delivery.note}</p>
                )}
                <p className="text-xs">
                  Customers confirm successful delivery from their account.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Delivery has not been initiated.
              </p>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Provider references</h2>
            <dl className="mt-4 space-y-3 text-xs">
              {[
                ["Provider", order.paymentProvider],
                ["Stripe session", order.stripeSessionId],
                ["PayPal order", order.paypalOrderId],
                ["PayPal capture", order.paypalCaptureId],
                ["M-Pesa receipt", order.mpesaReceiptNumber],
              ]
                .filter(([, v]) => v)
                .map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted">{key}</dt>
                    <dd className="mt-1 break-all font-mono text-ink">
                      {value}
                    </dd>
                  </div>
                ))}
            </dl>
          </Card>
        </div>
      </div>
      {deliveryOpen && (
        <DeliveryModal
          order={order}
          onClose={() => setDeliveryOpen(false)}
          onSaved={() => {
            setDeliveryOpen(false);
            load();
            notify(
              "Delivery initiated. The customer can now track and confirm it.",
            );
          }}
        />
      )}
      {reject && (
        <RejectModal
          refund={reject}
          onClose={() => setReject(null)}
          onSaved={() => {
            setReject(null);
            load();
            notify("Refund rejected.");
          }}
        />
      )}
    </>
  );
}
function DeliveryModal({ order, onClose, onSaved }) {
  const [form, setForm] = useState({ estimatedDeliveryAt: "", note: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {};
      if (form.note.trim()) body.note = form.note;
      if (form.estimatedDeliveryAt)
        body.estimatedDeliveryAt = new Date(
          form.estimatedDeliveryAt,
        ).toISOString();
      await adminApi.post(`/deliveries/orders/${order._id}/initiate`, body);
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Initiate delivery" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Estimated delivery"
          hint="Optional, but it must be in the future."
        >
          <CalendarInput
            className={inputClass}
            type="datetime-local"
            value={form.estimatedDeliveryAt}
            onChange={(e) =>
              setForm({ ...form, estimatedDeliveryAt: e.target.value })
            }
          />
        </Field>
        <Field label="Delivery note">
          <textarea
            className={`${inputClass} py-3`}
            maxLength="500"
            rows="4"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </Field>
        <Button className="w-full" disabled={busy}>
          {busy ? "Initiating…" : "Start delivery"}
        </Button>
      </form>
    </Modal>
  );
}
function RejectModal({ refund, onClose, onSaved }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post(`/refunds/${refund._id}/reject`, { reason });
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Reject refund" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Reason">
          <textarea
            required
            maxLength="1000"
            rows="5"
            className={`${inputClass} py-3`}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Field>
        <Button className="w-full" variant="danger" disabled={busy}>
          {busy ? "Rejecting…" : "Reject request"}
        </Button>
      </form>
    </Modal>
  );
}
