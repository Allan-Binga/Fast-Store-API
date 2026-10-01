import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { Select } from "../components/FormControls";
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

const ranges = { 7: "7 days", 30: "30 days", 90: "90 days" };
function rangeParams(days) {
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  return { from: from.toISOString(), to: to.toISOString() };
}

export default function Home() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageOpen, setMessageOpen] = useState(false);
  const { notify } = useAdmin();
  useEffect(() => {
    let active = true;
    const params = rangeParams(days);
    Promise.all([
      adminApi.get("/payment-transactions/metrics", { params }),
      adminApi.get("/stock/metrics", { params }),
      adminApi.get("/orders", { params: { limit: 8 } }),
      adminApi.get("/products", { params: { limit: 100 } }),
      adminApi.get("/users", { params: { limit: 100 } }),
      adminApi.get("/refunds", { params: { limit: 100 } }),
    ])
      .then(
        ([finance, stock, orders, products, users, refunds]) =>
          active &&
          setData({
            finance: finance.data,
            stock: stock.data,
            orders: orders.data,
            products: products.data,
            users: users.data,
            refunds: refunds.data,
          }),
      )
      .catch((error) =>
        notify(errorMessage(error, "Unable to load dashboard."), "error"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [days, notify]);
  const financial = data?.finance?.byCurrency?.[0] || {};
  const lowStock = useMemo(
    () =>
      (data?.products || [])
        .filter((product) => product.quantity <= (product.reorderPoint ?? 5))
        .slice(0, 5),
    [data],
  );
  const cards = [
    [
      "Gross revenue",
      money(financial.grossPaidRevenue, financial.currency),
      financial.revenueChangePercentage == null
        ? "No prior-period baseline"
        : `${financial.revenueChangePercentage >= 0 ? "+" : ""}${financial.revenueChangePercentage}% from prior period`,
      "payments",
    ],
    [
      "Net sales",
      money(financial.netSales, financial.currency),
      `${financial.paidTransactions || 0} completed payments`,
      "account_balance_wallet",
    ],
    [
      "Refunded",
      money(financial.refundedAmount, financial.currency),
      `${data?.refunds?.filter((item) => item.status === "requested").length || 0} pending requests`,
      "currency_exchange",
    ],
    [
      "Inventory value",
      money(data?.stock?.inventoryValue),
      `${data?.stock?.totalUnits || 0} units available`,
      "inventory_2",
    ],
  ];
  return (
    <>
      <PageHeader
        eyebrow="Executive commerce overview"
        title="Dashboard"
        description="Live revenue, order, refund, and stock signals from FastStore."
      >
        <Select
          className={`${inputClass} w-auto text-[10px]`}
          value={days}
          onChange={(e) => {
            setLoading(true);
            setDays(Number(e.target.value));
          }}
        >
          {Object.entries(ranges).map(([value, label]) => (
            <option key={value} value={value}>
              Last {label}
            </option>
          ))}
        </Select>
        <Button className="text-[10px]" onClick={() => setMessageOpen(true)}>
          <span className="material-symbols-outlined text-[17px]">send</span>
          Message customer
        </Button>
      </PageHeader>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="h-36 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, note, icon]) => (
            <Card key={label} className="p-5">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-muted">{label}</p>
                <span className="grid size-9 place-items-center rounded-xl bg-blue-50 text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    {icon}
                  </span>
                </span>
              </div>
              <p className="mt-5 text-2xl font-extrabold">{value}</p>
              <p className="mt-1 text-xs text-muted">{note}</p>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <Card>
          <header className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-bold">Recent orders</h2>
              <p className="text-xs text-muted">
                Newest purchases across payment providers
              </p>
            </div>
            <Link className="text-sm font-bold text-primary" to="/orders">
              View all
            </Link>
          </header>
          {loading ? (
            <SkeletonRows />
          ) : !data?.orders?.length ? (
            <Empty title="No orders yet" text="New orders will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-muted">
                  <tr>
                    <th className="px-5 py-3">Order</th>
                    <th className="px-5 py-3">Placed</th>
                    <th className="px-5 py-3">Payment</th>
                    <th className="px-5 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {data.orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <Link
                          className="font-bold text-primary"
                          to={`/orders/${order._id}`}
                        >
                          #{order._id.slice(-8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {shortDate(order.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge value={order.paymentStatus} />
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
        <div className="space-y-6">
          <Card>
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Stock health</h2>
              <p className="text-xs text-muted">
                Items at or below their reorder point
              </p>
            </header>
            {loading ? (
              <SkeletonRows rows={3} />
            ) : !lowStock.length ? (
              <Empty icon="check_circle" title="Stock levels look healthy" />
            ) : (
              <div className="divide-y divide-line">
                {lowStock.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-4"
                  >
                    <img
                      src={product.images?.[0]}
                      alt=""
                      className="size-10 rounded-lg bg-slate-100 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted">
                        Reorder at {product.reorderPoint ?? 5}
                      </p>
                    </div>
                    <StatusBadge
                      value={
                        product.quantity === 0
                          ? "out of stock"
                          : `${product.quantity} left`
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <Link
              to="/products"
              className="block border-t border-line px-5 py-3 text-center text-sm font-bold text-primary"
            >
              Manage inventory
            </Link>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Inventory performance</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Units sold", data?.stock?.unitsSold || 0],
                ["Sell-through", `${data?.stock?.sellThroughRate || 0}%`],
                ["Gross profit", money(data?.stock?.estimatedGrossProfit)],
                ["Low stock", `${data?.stock?.lowStockPercentage || 0}%`],
              ].map(([key, value]) => (
                <div key={key} className="rounded-xl bg-slate-50 p-3">
                  <p className="text-xs text-muted">{key}</p>
                  <strong className="mt-1 block">{value}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
      {messageOpen && (
        <MessageModal
          users={data?.users || []}
          onClose={() => setMessageOpen(false)}
          onSent={() => {
            setMessageOpen(false);
            notify("Customer notification sent.");
          }}
        />
      )}
    </>
  );
}

function MessageModal({ users, onClose, onSent }) {
  const [form, setForm] = useState({ userId: "", type: "order", message: "" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post("/notifications", form);
      onSent();
    } catch (error) {
      alert(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Message a customer" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Customer">
          <Select
            required
            className={inputClass}
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
          >
            <option value="">Choose a customer</option>
            {users
              .filter((user) => user.role === "Customer")
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.firstName} {user.lastName} — {user.email}
                </option>
              ))}
          </Select>
        </Field>
        <Field label="Notification type">
          <Select
            className={inputClass}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="order">Order</option>
            <option value="general">General</option>
          </Select>
        </Field>
        <Field label="Message">
          <textarea
            required
            maxLength="1000"
            rows="5"
            className={`${inputClass} py-3`}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </Field>
        <Button disabled={busy} className="w-full">
          {busy ? "Sending…" : "Send notification"}
        </Button>
      </form>
    </Modal>
  );
}
