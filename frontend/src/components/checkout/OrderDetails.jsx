import ProductImage from "../ProductImage";
import { paymentMoney } from "../../store/checkout";

function itemLineTotal(item) {
  return (Math.round(item.price * 100) * item.quantity) / 100;
}

export function OrderItems({ items, currency = "usd" }) {
  return (
    <div className="divide-y divide-outline-variant/60">
      {items.map((item) => (
        <div key={item.productId} className="flex flex-wrap items-center gap-4 py-4">
          <ProductImage
            src={item.image}
            alt={item.name}
            className="h-16 w-16 shrink-0 rounded-lg border border-outline-variant/40 object-contain"
          />
          <div className="min-w-0 flex-1">
            <h3 className="break-words font-semibold">{item.name}</h3>
            <p className="mt-1 text-sm text-outline">
              Qty: {item.quantity} · {paymentMoney(item.price, currency)} each
            </p>
          </div>
          <strong>{paymentMoney(itemLineTotal(item), currency)}</strong>
        </div>
      ))}
    </div>
  );
}

function ShippingDestination({ address }) {
  return (
    <section className="break-words rounded-xl border border-outline-variant/60 bg-surface-container-low p-4">
      <h2 className="mb-2 font-semibold">Shipping destination</h2>
      {address ? (
        <address className="space-y-1 text-sm not-italic">
          <p>
            {address.firstName} {address.lastName}
          </p>
          <p>{address.street}</p>
          <p>
            {address.city}, {address.state} {address.postalCode}
          </p>
          <p>{address.email}</p>
          <p>{address.phone}</p>
        </address>
      ) : (
        <p>Shipping details are unavailable.</p>
      )}
    </section>
  );
}

function PaymentSummary({ order }) {
  return (
    <section className="flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-low p-4">
      <h2 className="font-semibold">Payment summary</h2>
      <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-outline-variant pt-4">
        <span>{order.paymentStatus === "paid" ? "Total paid" : "Order total"}</span>
        <strong className="text-2xl text-primary">
          {paymentMoney(order.totalAmount, order.currency)}
        </strong>
      </div>
    </section>
  );
}

export default function OrderDetails({ order }) {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Order items</h2>
        <OrderItems items={order.items || []} currency={order.currency} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ShippingDestination address={order.shippingAddress} />
        <PaymentSummary order={order} />
      </div>
    </div>
  );
}
