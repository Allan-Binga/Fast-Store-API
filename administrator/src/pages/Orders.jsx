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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [payment, setPayment] = useState("");
  const [fulfillment, setFulfillment] = useState("");
  const { notify } = useAdmin();
  useEffect(() => {
    let active = true;
    adminApi
      .get("/orders", { params: { limit: 100 } })
      .then(({ data }) => active && setOrders(data))
      .catch((error) =>
        notify(errorMessage(error, "Unable to load orders."), "error"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [notify]);
  const shown = useMemo(
    () =>
      orders.filter(
        (order) =>
          (!query ||
            `${order._id} ${order.paymentProvider}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!payment || order.paymentStatus === payment) &&
          (!fulfillment || order.fulfillmentStatus === fulfillment),
      ),
    [orders, query, payment, fulfillment],
  );
  return (
    <>
      <PageHeader
        eyebrow="Sales operations"
        title="Orders"
        description="Open an order to review its customer, items, payment ledger, refunds, and delivery state."
      />
      <Card>
        <div className="grid gap-3 border-b border-line p-4 lg:grid-cols-[1fr_220px_220px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted">
              search
            </span>
            <input
              className={`${inputClass} pl-10`}
              placeholder="Search order ID or provider"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select
            className={inputClass}
            value={payment}
            onChange={(event) => setPayment(event.target.value)}
          >
            <option value="">All payment states</option>
            {[
              "pending",
              "paid",
              "partially_refunded",
              "refunded",
              "failed",
              "expired",
            ].map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
          <Select
            className={inputClass}
            value={fulfillment}
            onChange={(event) => setFulfillment(event.target.value)}
          >
            <option value="">All fulfillment states</option>
            <option value="unfulfilled">Unfulfilled</option>
            <option value="initiated">Initiated</option>
            <option value="delivered">Delivered</option>
          </Select>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : !shown.length ? (
          <Empty icon="receipt_long" title="No orders found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Placed</th>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Fulfillment</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        className="font-bold text-primary"
                        to={`/orders/${order._id}`}
                      >
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                      <p className="text-xs text-muted">
                        {order.items?.length || 0} line items
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {shortDate(order.createdAt)}
                    </td>
                    <td className="px-5 py-4 capitalize">
                      {order.paymentProvider || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge value={order.fulfillmentStatus} />
                    </td>
                    <td className="px-5 py-4 text-right font-bold">
                      {money(order.totalAmount, order.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
