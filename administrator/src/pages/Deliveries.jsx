import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { CalendarInput, Select } from "../components/FormControls";
import Modal from "../components/Modal";
import { Button, Card, Empty, Field, PageHeader, SkeletonRows, StatusBadge, inputClass, shortDate, money } from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Deliveries() {
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const pending = pathname.endsWith("/pending");
  const orderId = params.get("orderId") || "";
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState("");
  const [creating, setCreating] = useState(null);
  const [result, setResult] = useState(null);
  const { notify } = useAdmin();
  const key = `${pathname}:${orderId}:${page}:${attempt}:${status}`;
  const current = result?.key === key;
  useEffect(() => {
    let active = true;
    const query = pending ? { limit: 20, page, ...(orderId ? { orderId } : {}) } : { limit: 20, page, ...(status ? { status } : {}) };
    adminApi.get(pending ? "/deliveries/pending" : "/deliveries", { params: query }).then(({ data }) => { if (active) setResult({ key, data }); }).catch(error => { if (active) setResult({ key, error: errorMessage(error, "Unable to load deliveries.") }); });
    return () => { active = false; };
  }, [key, pending, orderId, page, status]);
  const rows = current ? (pending ? result.data?.orders : result.data) || [] : [];
  return <>
    <PageHeader eyebrow="Fulfillment operations" title={pending ? "Pending deliveries" : "Deliveries"} description={pending ? "Paid orders awaiting fulfillment. Review and initiate each requested delivery here, even if its email alert was missed." : "Track initiated deliveries and customer-confirmed completion."}>
      <Button variant="secondary" onClick={() => setAttempt(value => value + 1)}>Refresh</Button>
      {!pending && <Link to="/deliveries/pending" className="inline-flex min-h-10 items-center rounded-sm bg-primary px-4 py-2 text-sm font-bold text-white">Pending deliveries</Link>}
    </PageHeader>
    <nav aria-label="Delivery views" className="mb-5 flex gap-3"><Link to="/deliveries/pending" className={`rounded-sm border px-4 py-2 font-semibold ${pending ? "border-primary bg-primary text-white" : "border-line bg-white"}`}>Requested</Link><Link to="/deliveries" className={`rounded-sm border px-4 py-2 font-semibold ${!pending ? "border-primary bg-primary text-white" : "border-line bg-white"}`}>Initiated & delivered</Link></nav>
    {pending && orderId && <p className="mb-4 text-sm text-muted">Showing order #{orderId.slice(-8).toUpperCase()}. <Link to="/deliveries/pending" className="font-semibold text-primary underline">View all pending deliveries</Link></p>}
    <Card>
      {!pending && <div className="flex justify-end border-b border-line p-4"><Select aria-label="Delivery status" className={`${inputClass} sm:w-52`} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">Initiated & delivered</option><option value="initiated">Initiated</option><option value="delivered">Delivered</option></Select></div>}
      {!current ? <SkeletonRows /> : result.error ? <div role="alert" className="space-y-3 p-5 text-red-700"><p>{result.error}</p><Button onClick={() => setAttempt(value => value + 1)}>Try again</Button></div> : !rows.length ? <Empty icon="local_shipping" title={pending ? "No pending deliveries on this page" : "No deliveries found"} text={pending ? "Paid orders appear here automatically. An order may already have been initiated or refunded." : "Initiate a requested delivery to start fulfillment."} /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted"><tr><th className="px-5 py-3">Order</th><th className="px-5 py-3">{pending ? "Customer" : "Delivery"}</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">{pending ? "Paid" : "Initiated"}</th><th className="px-5 py-3">{pending ? "Amount" : "Estimated"}</th><th className="px-5 py-3">{pending ? "Action" : "Confirmed"}</th></tr></thead><tbody className="divide-y divide-line">{rows.map(row => <tr key={row._id}><td className="px-5 py-4"><Link className="font-bold text-primary" to={`/orders/${pending ? row._id : row.order}`}>#{String(pending ? row._id : row.order).slice(-8).toUpperCase()}</Link></td><td className="px-5 py-4">{pending ? <><strong>{row.user?.firstName} {row.user?.lastName}</strong><p className="text-xs text-muted">{row.user?.email}</p></> : <Link className="font-bold text-primary" to={`/deliveries/${row._id}`}>#{row._id.slice(-8).toUpperCase()}</Link>}</td><td className="px-5 py-4"><StatusBadge value={pending ? "requested" : row.status} /></td><td className="px-5 py-4 text-muted">{shortDate(pending ? row.paidAt || row.createdAt : row.initiatedAt)}</td><td className="px-5 py-4">{pending ? money(row.totalAmount, row.currency) : shortDate(row.estimatedDeliveryAt)}</td><td className="px-5 py-4">{pending ? <Button onClick={() => setCreating(row)}>Initiate delivery</Button> : shortDate(row.confirmedByCustomerAt)}</td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between border-t border-line p-4"><Button variant="secondary" disabled={!current || page === 1} onClick={() => setPage(value => value - 1)}>Previous</Button><span className="text-sm text-muted">Page {page}{pending && result?.data?.total !== undefined && current ? ` · ${result.data.total} requested` : ""}</span><Button variant="secondary" disabled={!current || Boolean(result?.error) || (pending ? page * 20 >= (result?.data?.total || 0) : rows.length < 20)} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </Card>
    {creating && <InitiateDelivery orders={[creating]} initialOrderId={creating._id} onClose={() => setCreating(null)} onSaved={() => { setCreating(null); setAttempt(value => value + 1); notify("Delivery initiated. The customer will receive a confirmation email."); }} />}
  </>;
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
