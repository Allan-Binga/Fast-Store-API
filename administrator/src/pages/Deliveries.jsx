import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { CalendarInput, Select } from "../components/FormControls";
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
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const [deliveryResult, orderResult] = await Promise.all([
        adminApi.get("/deliveries", { params: { limit: 100 } }),
        adminApi.get("/orders", { params: { limit: 100 } }),
      ]);
      setDeliveries(deliveryResult.data);
      setOrders(orderResult.data);
    } catch (error) {
      notify(errorMessage(error, "Unable to load deliveries."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = useMemo(
    () =>
      deliveries.filter((delivery) => !status || delivery.status === status),
    [deliveries, status],
  );
  const existingOrders = new Set(
    deliveries.map((delivery) => String(delivery.order)),
  );
  const eligibleOrders = orders.filter(
    (order) =>
      ["paid", "partially_refunded"].includes(order.paymentStatus) &&
      order.fulfillmentStatus === "unfulfilled" &&
      !existingOrders.has(String(order._id)),
  );
  return (
    <>
      <PageHeader
        eyebrow="Fulfillment operations"
        title="Deliveries"
        description="Initiate deliveries for paid orders and monitor customer-confirmed completion."
      >
        <Button
          onClick={() => setCreating(true)}
          disabled={!eligibleOrders.length}
        >
          <span className="material-symbols-outlined text-[19px]">
            local_shipping
          </span>
          Initiate delivery
        </Button>
      </PageHeader>
      <Card>
        <div className="flex justify-end border-b border-line p-4">
          <Select
            className={`${inputClass} sm:w-52`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="initiated">Initiated</option>
            <option value="delivered">Delivered</option>
          </Select>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : !shown.length ? (
          <Empty
            icon="local_shipping"
            title="No deliveries found"
            text={
              eligibleOrders.length
                ? "Use Initiate delivery to begin fulfillment."
                : "Paid, unfulfilled orders will become eligible here."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Delivery</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Initiated</th>
                  <th className="px-5 py-3">Estimated</th>
                  <th className="px-5 py-3">Confirmed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((delivery) => (
                  <tr key={delivery._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        className="font-bold text-primary"
                        to={`/deliveries/${delivery._id}`}
                      >
                        #{delivery._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold hover:text-primary"
                        to={`/orders/${delivery.order}`}
                      >
                        #{String(delivery.order).slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={delivery.status} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {shortDate(delivery.initiatedAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {shortDate(delivery.estimatedDeliveryAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {shortDate(delivery.confirmedByCustomerAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {creating && (
        <InitiateDelivery
          orders={eligibleOrders}
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
            notify("Delivery initiated.");
          }}
        />
      )}
    </>
  );
}
export function InitiateDelivery({
  orders,
  initialOrderId = "",
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState({
    orderId: initialOrderId,
    estimatedDeliveryAt: "",
    note: "",
  });
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = {};
      if (form.note.trim()) body.note = form.note;
      if (form.estimatedDeliveryAt)
        body.estimatedDeliveryAt = new Date(
          form.estimatedDeliveryAt,
        ).toISOString();
      await adminApi.post(`/deliveries/orders/${form.orderId}/initiate`, body);
      onSaved();
    } catch (error) {
      alert(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Initiate delivery" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Paid order">
          <Select
            className={inputClass}
            required
            value={form.orderId}
            onChange={(event) =>
              setForm({ ...form, orderId: event.target.value })
            }
          >
            <option value="">Choose an order</option>
            {orders.map((order) => (
              <option key={order._id} value={order._id}>
                #{order._id.slice(-8).toUpperCase()} —{" "}
                {order.items?.length || 0} items
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Estimated delivery">
          <CalendarInput
            className={inputClass}
            type="datetime-local"
            value={form.estimatedDeliveryAt}
            onChange={(event) =>
              setForm({ ...form, estimatedDeliveryAt: event.target.value })
            }
          />
        </Field>
        <Field label="Delivery note">
          <textarea
            className={`${inputClass} py-3`}
            maxLength="500"
            rows="4"
            value={form.note}
            onChange={(event) => setForm({ ...form, note: event.target.value })}
          />
        </Field>
        <Button className="w-full" disabled={busy}>
          {busy ? "Initiating…" : "Initiate delivery"}
        </Button>
      </form>
    </Modal>
  );
}
