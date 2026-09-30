import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { customerRequest, errorMessage } from "../api";
import CustomerAccountNav from "../components/CustomerAccountNav";
import OrderStatusBadge from "../components/OrderStatusBadge";
import ProductImage from "../components/ProductImage";
import { readableStatus } from "../utils/formatting";
import CheckoutLayout, {
  AccountRequired,
  panelClass,
  primaryClass,
  secondaryClass,
} from "../components/checkout/CheckoutLayout";
import useCustomerResource from "../hooks/useCustomerResource";
import { paymentMoney } from "../store/checkout";
import { useStore } from "../store/context";

const refundReasons = [
  ["customer_request", "I changed my mind"],
  ["cancelled_before_shipping", "Cancel before shipping"],
  ["damaged_product", "Product arrived damaged"],
  ["wrong_product", "Wrong product received"],
  ["non_delivery", "Order was not delivered"],
  ["duplicate_payment", "Duplicate payment"],
  ["other", "Another reason"],
];

const refundStatusCopy = {
  requested: "Your request is waiting for administrator review.",
  processing: "The approved refund is being processed by the payment provider.",
  succeeded: "The payment provider completed this refund.",
  failed: "The provider could not complete this refund.",
  rejected: "The store reviewed and declined this request.",
};

function refundableBalance(order) {
  return Math.max(
    0,
    Math.round(
      (order.totalAmount -
        (order.refundedAmount || 0) -
        (order.refundPendingAmount || 0)) *
        100,
    ) / 100,
  );
}


function RefundFormSkeleton() {
  return (
    <div role="status" aria-label="Loading eligible orders" className="animate-pulse space-y-5">
      <span className="sr-only">Loading eligible orders…</span>
      <div aria-hidden="true" className="space-y-5">
        <div className="space-y-2">
          <div className="h-4 w-16 rounded-full bg-surface-container-high" />
          <div className="h-11 w-full rounded-sm bg-surface-container-high" />
        </div>
        <div className="grid grid-cols-3 gap-3 rounded-sm bg-surface-container-low p-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-3 w-16 rounded-full bg-surface-container-high" />
              <div className="h-5 w-24 max-w-full rounded-full bg-surface-container-high" />
            </div>
          ))}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="h-16 rounded-sm bg-surface-container-high" />
          <div className="h-16 rounded-sm bg-surface-container-high" />
        </div>
        <div className="h-28 rounded-sm bg-surface-container-high" />
        <div className="h-11 w-48 rounded-sm bg-surface-container-high" />
      </div>
    </div>
  );
}

function RefundHistorySkeleton() {
  return (
    <div role="status" aria-label="Loading refund history" className="space-y-4">
      <span className="sr-only">Loading refund history…</span>
      {[0, 1].map((item) => (
        <div
          key={item}
          aria-hidden="true"
          className="animate-pulse space-y-3 rounded-md border border-outline-variant bg-white p-5"
        >
          <div className="flex justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-28 rounded-full bg-surface-container-high" />
              <div className="h-6 w-24 rounded-full bg-surface-container-high" />
            </div>
            <div className="h-7 w-24 rounded-full bg-surface-container-high" />
          </div>
          <div className="h-4 w-full rounded-full bg-surface-container" />
          <div className="h-4 w-2/3 rounded-full bg-surface-container" />
          <div className="h-10 w-32 rounded-sm bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}

function RefundRequestForm({ orders, ordersLoading, reloadOrders, reloadRefunds }) {
  const { invalidateSession } = useStore();
  const [params] = useSearchParams();
  const requestedOrderId = params.get("orderId") || "";
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("customer_request");
  const [amount, setAmount] = useState("");
  const [explanation, setExplanation] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidenceInputKey, setEvidenceInputKey] = useState(0);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const eligibleOrders = useMemo(
    () =>
      (orders || []).filter(
        (order) =>
          ["stripe", "paypal"].includes(order.paymentProvider) &&
          ["paid", "partially_refunded"].includes(order.paymentStatus) &&
          refundableBalance(order) > 0,
      ),
    [orders],
  );

  const selectedOrder =
    eligibleOrders.find((order) => String(order._id) === orderId) ||
    eligibleOrders.find((order) => String(order._id) === requestedOrderId) ||
    eligibleOrders[0];
  const selectedOrderId = String(selectedOrder?._id || "");
  const remaining = selectedOrder ? refundableBalance(selectedOrder) : 0;

  async function submitRefund(event) {
    event.preventDefault();
    if (!selectedOrder || pending) return;

    const numericAmount = amount === "" ? undefined : Number(amount);

    if (
      numericAmount !== undefined &&
      (!Number.isFinite(numericAmount) ||
        numericAmount <= 0 ||
        numericAmount > remaining)
    ) {
      setFeedback({
        type: "error",
        message: "Enter an amount greater than zero and no more than the refundable balance.",
      });
      return;
    }

    const trimmedExplanation = explanation.trim();
    if (trimmedExplanation.length > 1000) {
      setFeedback({
        type: "error",
        message: "The explanation must not exceed 1,000 characters.",
      });
      return;
    }

    setPending(true);
    setFeedback(null);

    const refundData = {
      reason,
      ...(numericAmount === undefined ? {} : { amount: numericAmount }),
      ...(trimmedExplanation ? { explanation: trimmedExplanation } : {}),
    };
    let requestData = refundData;

    if (evidenceFiles.length) {
      const formData = new FormData();

      Object.entries(refundData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      evidenceFiles.forEach((file) => formData.append("evidence", file));
      requestData = formData;
    }

    try {
      await customerRequest({
        method: "post",
        url: `/refunds/orders/${encodeURIComponent(selectedOrder._id)}/request`,
        data: requestData,
      });
      setAmount("");
      setExplanation("");
      setEvidenceFiles([]);
      setEvidenceInputKey((value) => value + 1);
      setReason("customer_request");
      setFeedback({
        type: "success",
        message: "Refund request submitted for administrator review.",
      });
      reloadOrders();
      reloadRefunds();
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        invalidateSession();
        return;
      }
      setFeedback({ type: "error", message: errorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className={`${panelClass} min-h-[44rem]`} aria-labelledby="refund-request-title">
      <header className="mb-5 border-b border-outline-variant/60 pb-4">
        <h1 id="refund-request-title" className="text-2xl font-bold">
          Request a refund
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Eligible Stripe and PayPal payments are returned through their original
          payment provider after administrator approval.
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

      {ordersLoading ? (
        <RefundFormSkeleton />
      ) : eligibleOrders.length === 0 ? (
        <div className="rounded-sm border border-dashed border-outline-variant p-5 text-center">
          <p className="font-semibold">No refundable orders are currently available.</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            M-Pesa payments and unpaid, fully refunded, or already reserved balances
            are excluded.
          </p>
          <Link to="/orders" className={`${secondaryClass} mt-4`}>
            View orders
          </Link>
        </div>
      ) : (
        <form onSubmit={submitRefund} className="space-y-5" noValidate>
          <fieldset disabled={pending} className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Order</span>
              <select
                value={selectedOrderId}
                onChange={(event) => {
                  setOrderId(event.target.value);
                  setAmount("");
                  setFeedback(null);
                }}
                className="min-h-11 w-full rounded-sm border border-outline-variant bg-white px-3.5 py-2.5"
              >
                {eligibleOrders.map((order) => (
                  <option key={order._id} value={order._id}>
                    {order._id} — {paymentMoney(refundableBalance(order), order.currency)} refundable
                  </option>
                ))}
              </select>
            </label>

            {selectedOrder && (
              <div className="grid gap-3 rounded-sm bg-surface-container-low p-4 text-sm sm:grid-cols-3">
                <div>
                  <span className="block text-outline">Paid total</span>
                  <strong>
                    {paymentMoney(selectedOrder.totalAmount, selectedOrder.currency)}
                  </strong>
                </div>
                <div>
                  <span className="block text-outline">Already refunded</span>
                  <strong>
                    {paymentMoney(
                      selectedOrder.refundedAmount || 0,
                      selectedOrder.currency,
                    )}
                  </strong>
                </div>
                <div>
                  <span className="block text-outline">Available</span>
                  <strong className="text-primary">
                    {paymentMoney(remaining, selectedOrder.currency)}
                  </strong>
                </div>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">Reason</span>
                <select
                  value={reason}
                  onChange={(event) => {
                    const nextReason = event.target.value;
                    setReason(nextReason);
                    setFeedback(null);

                    if (!["damaged_product", "wrong_product"].includes(nextReason)) {
                      setEvidenceFiles([]);
                      setEvidenceInputKey((value) => value + 1);
                    }
                  }}
                  className="min-h-11 w-full rounded-sm border border-outline-variant bg-white px-3.5 py-2.5"
                >
                  {refundReasons.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-semibold">
                  Amount <span className="font-normal text-outline">(optional)</span>
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  max={remaining}
                  step="0.01"
                  value={amount}
                  onChange={(event) => {
                    setAmount(event.target.value);
                    setFeedback(null);
                  }}
                  placeholder={`Full balance: ${paymentMoney(
                    remaining,
                    selectedOrder?.currency,
                  )}`}
                  className="min-h-11 w-full rounded-sm border border-outline-variant bg-white px-3.5 py-2.5"
                />
                <span className="mt-1 block text-xs text-outline">
                  Leave blank to request the full available balance.
                </span>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                Explanation <span className="font-normal text-outline">(optional)</span>
              </span>
              <textarea
                rows="4"
                maxLength="1000"
                value={explanation}
                onChange={(event) => setExplanation(event.target.value)}
                placeholder="Add details that will help the administrator review your request."
                className="w-full rounded-sm border border-outline-variant bg-white px-3.5 py-2.5"
              />
              <span className="block text-right text-xs text-outline">
                {explanation.length}/1000
              </span>
            </label>

            {["damaged_product", "wrong_product"].includes(reason) && (
              <div className="rounded-sm border border-outline-variant bg-surface-container-low p-4">
                {reason === "wrong_product" && selectedOrder?.items?.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-semibold">What you originally ordered</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={item.productId}
                          className="flex items-center gap-3 rounded-sm border border-outline-variant/60 bg-white p-2"
                        >
                          <ProductImage
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 shrink-0 rounded-sm object-contain"
                          />
                          <div className="min-w-0 text-sm">
                            <p className="break-words font-semibold">{item.name}</p>
                            <p className="text-outline">Ordered quantity: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">
                    {reason === "wrong_product" ? "Wrong-product photos" : "Damage photos"}{" "}
                    <span className="font-normal text-outline">(optional, maximum 2)</span>
                  </span>
                  <input
                    key={evidenceInputKey}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => {
                      const files = Array.from(event.target.files || []);
                      const allowedTypes = new Set([
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                      ]);

                      if (files.length > 2) {
                        event.target.value = "";
                        setEvidenceFiles([]);
                        setFeedback({
                          type: "error",
                          message: "Choose no more than two evidence photos.",
                        });
                        return;
                      }

                      if (
                        files.some(
                          (file) =>
                            !allowedTypes.has(file.type) ||
                            file.size > 5 * 1024 * 1024,
                        )
                      ) {
                        event.target.value = "";
                        setEvidenceFiles([]);
                        setFeedback({
                          type: "error",
                          message:
                            "Evidence photos must be JPEG, PNG, or WebP and no larger than 5 MB each.",
                        });
                        return;
                      }

                      setEvidenceFiles(files);
                      setFeedback(null);
                    }}
                    className="block w-full rounded-sm border border-outline-variant bg-white text-sm file:mr-4 file:min-h-11 file:border-0 file:border-r file:border-outline-variant file:bg-surface-container-high file:px-4 file:font-semibold file:text-primary"
                  />
                </label>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {reason === "wrong_product"
                    ? "Upload clear photos showing the item you received and its packaging."
                    : "Upload clear photos showing the damaged product or packaging."}{" "}
                  Files are stored with your refund request.
                </p>
                {evidenceFiles.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm" aria-label="Selected evidence photos">
                    {evidenceFiles.map((file) => (
                      <li key={`${file.name}-${file.lastModified}`} className="break-all">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </fieldset>

          <button type="submit" disabled={pending || !selectedOrder} className={primaryClass}>
            {pending ? "Submitting request…" : "Submit refund request"}
          </button>
        </form>
      )}
    </section>
  );
}

function RefundHistory({ resource }) {
  return (
    <section className={`${panelClass} min-h-[44rem]`} aria-labelledby="refund-history-title">
      <header className="mb-5 border-b border-outline-variant/60 pb-4">
        <h2 id="refund-history-title" className="text-2xl font-bold">
          Refund history
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          Track requests from review through payment-provider completion.
        </p>
      </header>

      {resource.loading && <RefundHistorySkeleton />}
      {resource.error && (
        <div role="alert" className="space-y-3 text-error">
          <p>{resource.error}</p>
          <button onClick={resource.retry} className={secondaryClass}>
            Try again
          </button>
        </div>
      )}
      {!resource.loading && !resource.error && !resource.data?.length && (
        <p className="rounded-sm border border-dashed border-outline-variant p-5 text-center text-on-surface-variant">
          You have not requested a refund.
        </p>
      )}

      <div className="space-y-4">
        {resource.data?.map((refund) => (
          <article
            key={refund._id}
            className="space-y-3 rounded-md border border-outline-variant bg-white p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-outline">
                  {readableStatus(refund.reason)}
                </p>
                <h3 className="mt-1 text-xl font-bold text-primary">
                  {paymentMoney(refund.amount, refund.currency)}
                </h3>
              </div>
              <OrderStatusBadge status={refund.status} />
            </div>
            <p className="text-sm text-on-surface-variant">
              {refundStatusCopy[refund.status] || "Refund status is available above."}
            </p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-outline">Order</dt>
                <dd className="break-all font-medium">{refund.order}</dd>
              </div>
              <div>
                <dt className="text-outline">Requested</dt>
                <dd>{new Date(refund.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
            {refund.customerExplanation && (
              <p className="rounded-sm bg-surface-container-low p-3 text-sm">
                {refund.customerExplanation}
              </p>
            )}
            {refund.evidenceImages?.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Submitted evidence</p>
                <div className="grid grid-cols-2 gap-3">
                  {refund.evidenceImages.map((image, index) => (
                    <a
                      key={image}
                      href={image}
                      target="_blank"
                      rel="noreferrer"
                      className="overflow-hidden rounded-sm border border-outline-variant bg-surface-container-low"
                    >
                      <img
                        src={image}
                        alt={`Refund evidence ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {(refund.rejectionReason || refund.failureReason) && (
              <p className="rounded-sm bg-error-container/40 p-3 text-sm text-error">
                {refund.rejectionReason || refund.failureReason}
              </p>
            )}
            <Link
              to={`/payment-result?order_id=${encodeURIComponent(refund.order)}`}
              className="inline-block text-sm font-semibold text-primary underline"
            >
              View related order
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function RefundCenter() {
  const orders = useCustomerResource("/orders/user?limit=100&page=1");
  const refunds = useCustomerResource("/refunds/user?limit=50&page=1");

  return (
    <>
      <CustomerAccountNav />
      {orders.error && (
        <div role="alert" className="mb-6 rounded-sm border border-error/30 bg-error-container/40 p-4 text-error">
          <p>{orders.error}</p>
          <button onClick={orders.retry} className={`${secondaryClass} mt-3`}>
            Reload orders
          </button>
        </div>
      )}
      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <RefundRequestForm
          orders={orders.data}
          ordersLoading={orders.loading}
          reloadOrders={orders.retry}
          reloadRefunds={refunds.retry}
        />
        <RefundHistory resource={refunds} />
      </div>
    </>
  );
}

export default function Refunds() {
  const { session } = useStore();

  useEffect(() => {
    document.title = "Refunds | FastStore";
  }, []);

  return (
    <CheckoutLayout title="Refunds">
      <AccountRequired>
        <RefundCenter key={session.user?._id || session.user?.email} />
      </AccountRequired>
    </CheckoutLayout>
  );
}
