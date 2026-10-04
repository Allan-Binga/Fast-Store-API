import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { Select } from "../components/FormControls";
import {
  Card,
  Empty,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  inputClass,
  money,
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Checkouts() {
  const [tab, setTab] = useState("attempts");
  const [checkouts, setCheckouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [provider, setProvider] = useState("");
  const [status, setStatus] = useState("");
  const { notify } = useAdmin();
  useEffect(() => {
    let active = true;
    Promise.all([
      adminApi.get("/checkout", { params: { limit: 100 } }),
      adminApi.get("/payment-transactions", { params: { limit: 100 } }),
    ])
      .then(([checkoutResult, transactionResult]) => {
        if (active) {
          setCheckouts(checkoutResult.data);
          setTransactions(transactionResult.data);
        }
      })
      .catch((error) =>
        notify(
          errorMessage(error, "Unable to load checkout activity."),
          "error",
        ),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [notify]);
  const shownCheckouts = useMemo(
    () =>
      checkouts.filter(
        (checkout) =>
          (!provider || checkout.paymentProvider === provider) &&
          (!status || checkout.paymentStatus === status),
      ),
    [checkouts, provider, status],
  );
  const shownTransactions = useMemo(
    () =>
      transactions.filter(
        (transaction) =>
          (!provider || transaction.provider === provider) &&
          (!status || transaction.status === status),
      ),
    [transactions, provider, status],
  );
  return (
    <>
      <PageHeader
        eyebrow="Payment operations"
        title="Checkouts"
        description="Monitor checkout attempts and the immutable payment transaction ledger across providers."
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="flex gap-1">
            <button
              className={`rounded-md px-4 py-2 text-sm font-bold cursor-pointer ${tab === "attempts" ? "bg-primary text-white" : "text-muted hover:bg-slate-100"}`}
              onClick={() => {
                setTab("attempts");
                setStatus("");
              }}
            >
              Checkout attempts
            </button>
            <button
              className={`rounded-md px-4 py-2 text-sm font-bold cursor-pointer ${tab === "transactions" ? "bg-primary text-white" : "text-muted hover:bg-slate-100"}`}
              onClick={() => {
                setTab("transactions");
                setStatus("");
              }}
            >
              Transactions
            </button>
          </div>
          <Select
            className={`${inputClass} lg:ml-auto lg:w-44`}
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          >
            <option value="">All providers</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="wallet">Wallet</option>
            {tab === "attempts" && <option value="mpesa">M-Pesa</option>}
          </Select>
          <Select
            className={`${inputClass} lg:w-52`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {(tab === "attempts"
              ? [
                  "pending",
                  "paid",
                  "partially_refunded",
                  "refunded",
                  "failed",
                  "expired",
                ]
              : ["pending", "succeeded", "failed", "cancelled"]
            ).map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : tab === "attempts" ? (
          <CheckoutTable rows={shownCheckouts} />
        ) : (
          <TransactionTable rows={shownTransactions} />
        )}
      </Card>
    </>
  );
}
function CheckoutTable({ rows }) {
  if (!rows.length)
    return (
      <Empty icon="shopping_cart_checkout" title="No checkout attempts found" />
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-muted">
          <tr>
            <th className="px-5 py-3">Checkout</th>
            <th className="px-5 py-3">Provider</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3">Created</th>
            <th className="px-5 py-3">Expires</th>
            <th className="px-5 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((checkout) => (
            <tr key={checkout._id} className="hover:bg-slate-50">
              <td className="px-5 py-4">
                <Link
                  to={`/orders/${checkout._id}`}
                  className="font-bold text-primary"
                >
                  #{checkout._id.slice(-8).toUpperCase()}
                </Link>
                <p className="text-xs text-muted">
                  {checkout.items?.length || 0} line items
                </p>
              </td>
              <td className="px-5 py-4 capitalize">
                {checkout.paymentProvider}
              </td>
              <td className="px-5 py-4">
                <StatusBadge value={checkout.paymentStatus} />
              </td>
              <td className="px-5 py-4 text-muted">
                {shortDate(checkout.createdAt)}
              </td>
              <td className="px-5 py-4 text-muted">
                {shortDate(checkout.expiresAt)}
              </td>
              <td className="px-5 py-4 text-right font-bold">
                {money(checkout.totalAmount, checkout.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function TransactionTable({ rows }) {
  if (!rows.length)
    return <Empty icon="payments" title="No transactions found" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-muted">
          <tr>
            <th className="px-5 py-3">Transaction</th>
            <th className="px-5 py-3">Order</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Provider</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((transaction) => (
            <tr key={transaction._id}>
              <td className="px-5 py-4">
                <p className="font-mono text-xs">
                  {transaction.providerTransactionId}
                </p>
                <p className="text-xs text-muted">
                  {shortDate(transaction.occurredAt)}
                </p>
              </td>
              <td className="px-5 py-4">
                <Link
                  to={`/orders/${transaction.order}`}
                  className="font-bold text-primary"
                >
                  #{String(transaction.order).slice(-8).toUpperCase()}
                </Link>
              </td>
              <td className="px-5 py-4 capitalize">{transaction.type}</td>
              <td className="px-5 py-4 capitalize">{transaction.provider}</td>
              <td className="px-5 py-4">
                <StatusBadge value={transaction.status} />
              </td>
              <td className="px-5 py-4 text-right font-bold">
                {money(transaction.amount, transaction.currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
