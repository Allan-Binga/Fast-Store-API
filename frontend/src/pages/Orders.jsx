import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CheckoutLayout, {
  AccountRequired,
  panelClass,
  primaryClass,
  secondaryClass,
} from "../components/checkout/CheckoutLayout";
import { paymentMoney } from "../store/checkout";
import useCustomerResource from "../hooks/useCustomerResource";
import { useStore } from "../store/context";

function OrderHistory() {
  const [page, setPage] = useState(1);
  const orders = useCustomerResource(`/orders/user?limit=10&page=${page}`);

  return (
    <section className={`${panelClass} mx-auto max-w-3xl`}>
      <h1 className="mb-6 text-3xl font-bold">Your orders</h1>
      {orders.loading && <p role="status">Loading orders…</p>}
      {orders.error && (
        <div role="alert" className="space-y-4">
          <p className="text-error">{orders.error}</p>
          <button onClick={orders.retry} className={secondaryClass}>
            Try again
          </button>
        </div>
      )}
      {orders.data?.length === 0 && <p>No orders on this page.</p>}
      <div className="divide-y divide-outline-variant">
        {orders.data?.map((order) => (
          <article key={order._id} className="space-y-3 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="break-all font-semibold">Order {order._id}</h2>
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-sm capitalize">
                {order.paymentStatus}
              </span>
            </div>
            <p className="text-sm text-outline">
              {new Date(order.createdAt).toLocaleDateString()} ·{" "}
              {paymentMoney(order.totalAmount, order.currency)}
            </p>
            <Link
              to={`/payment-result?order_id=${order._id}`}
              className="inline-block font-semibold text-primary underline"
            >
              View order and payment status
            </Link>
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
      <Link to="/" className={`${primaryClass} mt-6`}>
        Continue shopping
      </Link>
    </section>
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
