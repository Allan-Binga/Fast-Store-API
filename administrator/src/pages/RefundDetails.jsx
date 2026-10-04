import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
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
import { BackLink } from "./ProductDetails";

export default function RefundDetails() {
  const { refundId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState(false);
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const refundResult = await adminApi.get(`/refunds/${refundId}`);
      const refund = refundResult.data;
      const [orderResult, userResult] = await Promise.all([
        adminApi.get(`/orders/${refund.order}`),
        adminApi.get(`/users/${refund.user}`),
      ]);
      setData({ refund, order: orderResult.data, customer: userResult.data });
    } catch (error) {
      notify(errorMessage(error, "Unable to load refund."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [refundId]); // eslint-disable-line react-hooks/exhaustive-deps
  async function approve() {
    if (!window.confirm(refund.destination === "wallet" || refund.provider === "wallet" ? "Approve this refund as wallet credit?" : "Approve this refund with the payment provider?"))
      return;
    try {
      await adminApi.post(`/refunds/${refundId}/approve`);
      notify("Refund processed.");
      load();
    } catch (error) {
      notify(errorMessage(error), "error");
    }
  }
  if (loading)
    return (
      <Card>
        <SkeletonRows />
      </Card>
    );
  if (!data)
    return (
      <Card>
        <Empty title="Refund not found" />
      </Card>
    );
  const { refund, order, customer } = data;
  return (
    <>
      <BackLink to="/refunds">Refunds</BackLink>
      <PageHeader
        eyebrow="Refund record"
        title={`Refund #${refund._id.slice(-8).toUpperCase()}`}
        description={`Requested ${shortDate(refund.createdAt)} by ${customer.firstName} ${customer.lastName}`}
      >
        <StatusBadge value={refund.status} />
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Request details</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Info
                label="Amount"
                value={money(refund.amount, refund.currency)}
              />
              <Info label="Reason" value={refund.reason.replaceAll("_", " ")} />
              <Info label="Provider" value={refund.provider} />
              <Info label="Refund destination" value={refund.destination === "wallet" || refund.provider === "wallet" ? "Customer wallet" : "Original payment method"} />
              <Info label="Requested by" value={refund.requestedByRole} />
            </dl>
            {refund.customerExplanation && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase text-muted">
                  Customer explanation
                </p>
                <p className="mt-2 text-sm">{refund.customerExplanation}</p>
              </div>
            )}
            {refund.rejectionReason && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                Rejection reason: {refund.rejectionReason}
              </div>
            )}
            {refund.failureReason && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                Processing failure: {refund.failureReason}
              </div>
            )}
          </Card>
          <Card>
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Photo evidence</h2>
            </header>
            {refund.evidenceImages?.length ? (
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {refund.evidenceImages.map((image, index) => (
                  <a key={image} href={image} target="_blank" rel="noreferrer">
                    <img
                      src={image}
                      alt={`Refund evidence ${index + 1}`}
                      className="h-72 w-full rounded-2xl object-cover"
                    />
                  </a>
                ))}
              </div>
            ) : (
              <Empty icon="image" title="No photo evidence supplied" />
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Related order</h2>
            <Link
              to={`/orders/${order._id}`}
              className="mt-4 block rounded-xl bg-slate-50 p-4 hover:bg-blue-50"
            >
              <p className="font-bold text-primary">
                Order #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="mt-1 text-sm text-muted">
                {money(order.totalAmount, order.currency)} ·{" "}
                {order.items?.length || 0} items
              </p>
            </Link>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Customer</h2>
            <p className="mt-4 font-bold">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-sm text-muted">{customer.email}</p>
            <p className="text-sm text-muted">{customer.phone}</p>
          </Card>
          {refund.status === "requested" && (
            <Card className="p-5">
              <h2 className="font-bold">Decision</h2>
              <p className="mt-2 text-sm text-muted">
                Approval sends the refund to {refund.destination === "wallet" || refund.provider === "wallet" ? "the customer wallet" : refund.provider}. Review the
                evidence and order before proceeding.
              </p>
              <div className="mt-4 flex gap-2">
                <Button onClick={approve}>Approve refund</Button>
                <Button variant="secondary" onClick={() => setRejecting(true)}>
                  Reject
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
      {rejecting && (
        <RejectModal
          refund={refund}
          onClose={() => setRejecting(false)}
          onSaved={() => {
            setRejecting(false);
            load();
            notify("Refund rejected.");
          }}
        />
      )}
    </>
  );
}
function Info({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
      <dd className="mt-1 font-semibold capitalize">{value}</dd>
    </div>
  );
}
function RejectModal({ refund, onClose, onSaved }) {
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.post(`/refunds/${refund._id}/reject`, { reason });
      onSaved();
    } catch (error) {
      alert(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Reject refund" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Reason">
          <textarea
            className={`${inputClass} py-3`}
            required
            maxLength="1000"
            rows="5"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
          />
        </Field>
        <Button variant="danger" className="w-full" disabled={busy}>
          {busy ? "Rejecting…" : "Reject request"}
        </Button>
      </form>
    </Modal>
  );
}
