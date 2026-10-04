import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import {
  Card,
  Empty,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  money,
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";
import { BackLink } from "./ProductDetails";

export default function DeliveryDetails() {
  const { deliveryId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useAdmin();
  useEffect(() => {
    let active = true;
    adminApi
      .get(`/deliveries/${deliveryId}`)
      .then(async ({ data: delivery }) => {
        const [orderResult, userResult] = await Promise.all([
          adminApi.get(`/orders/${delivery.order}`),
          adminApi.get(`/users/${delivery.user}`),
        ]);
        if (active)
          setData({
            delivery,
            order: orderResult.data,
            customer: userResult.data,
          });
      })
      .catch((error) =>
        notify(errorMessage(error, "Unable to load delivery."), "error"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [deliveryId, notify]);
  if (loading)
    return (
      <Card>
        <SkeletonRows />
      </Card>
    );
  if (!data)
    return (
      <Card>
        <Empty title="Delivery not found" />
      </Card>
    );
  const { delivery, order, customer } = data;
  const address = order.shippingAddress || {};
  return (
    <>
      <BackLink to="/deliveries">Deliveries</BackLink>
      <PageHeader
        eyebrow="Delivery record"
        title={`Delivery #${delivery._id.slice(-8).toUpperCase()}`}
        description={delivery.status === "requested" ? "Payment confirmed · awaiting delivery initiation" : `Initiated ${shortDate(delivery.initiatedAt)}`}
      >
        <StatusBadge value={delivery.status} />
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Delivery timeline</h2>
            <div className="mt-5 space-y-5">
              <Timeline title="Delivery requested" date={order.paidAt || delivery.createdAt} complete />
              <Timeline
                title="Delivery initiated"
                date={delivery.initiatedAt}
                complete={delivery.status !== "requested"}
              />
              <Timeline
                title="Estimated delivery"
                date={delivery.estimatedDeliveryAt}
                complete={Boolean(delivery.estimatedDeliveryAt)}
              />
              <Timeline
                title="Confirmed by customer"
                date={delivery.confirmedByCustomerAt}
                complete={delivery.status === "delivered"}
              />
            </div>
            {delivery.note && (
              <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
                {delivery.note}
              </p>
            )}
          </Card>
          <Card>
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Order items</h2>
            </header>
            <div className="divide-y divide-line">
              {order.items?.map((item, index) => (
                <div
                  key={`${item.productId}-${index}`}
                  className="flex items-center gap-3 p-4"
                >
                  <img
                    src={item.image}
                    alt=""
                    className="size-14 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xs text-muted">
                      {item.quantity} × {money(item.price, order.currency)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Related order</h2>
            <Link
              to={`/orders/${order._id}`}
              className="mt-4 block rounded-xl bg-slate-50 p-4"
            >
              <p className="font-bold text-primary">
                Order #{order._id.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-muted">
                {money(order.totalAmount, order.currency)}
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
          <Card className="p-5">
            <h2 className="font-bold">Shipping address</h2>
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
          </Card>
        </div>
      </div>
    </>
  );
}
function Timeline({ title, date, complete }) {
  return (
    <div className="flex gap-3">
      <span
        className={`mt-0.5 grid size-8 place-items-center rounded-full ${complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-muted"}`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {complete ? "check" : "schedule"}
        </span>
      </span>
      <div>
        <p className="font-bold">{title}</p>
        <p className="text-sm text-muted">{shortDate(date)}</p>
      </div>
    </div>
  );
}
