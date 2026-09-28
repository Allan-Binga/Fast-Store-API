import { Link } from "react-router-dom";
import InformationLayout, { InfoCallout, InfoSection } from "../components/InformationLayout";

const helpLinks = [
  { icon: "receipt_long", title: "Order status", text: "Review paid, pending, or expired orders.", to: "/orders" },
  { icon: "shopping_bag", title: "Cart", text: "Update quantities and review availability.", to: "/cart" },
  { icon: "location_on", title: "Saved addresses", text: "Add or correct a delivery address.", to: "/account/addresses" },
  { icon: "lock_reset", title: "Password help", text: "Request a secure password-reset link.", to: "/password-reset" },
];

function HelpLink({ item }) {
  return (
    <Link to={item.to} className="rounded-md border border-outline-variant p-4 hover:border-primary hover:bg-surface-container-low">
      <span aria-hidden="true" className="material-symbols-outlined text-primary">{item.icon}</span>
      <h2 className="mt-2 font-semibold text-on-surface">{item.title}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">{item.text}</p>
    </Link>
  );
}

export default function HelpCenter() {
  return (
    <InformationLayout
      title="Help Center"
      intro="Find the fastest route to common account, cart, checkout, and payment answers."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {helpLinks.map((item) => <HelpLink key={item.title} item={item} />)}
      </div>

      <InfoSection title="Payment says pending">
        <p>Do not immediately pay again. Return to the payment-result link or open Your Orders and check the current status. Stripe, PayPal, and M-Pesa can confirm asynchronously when a provider response is delayed.</p>
      </InfoSection>

      <InfoSection title="My cart or wishlist disappeared">
        <p>Cart and wishlist data belong to the signed-in account. Confirm that you signed into the same verified email address. If your session ended, signing in from the cart or another protected page returns you to that page.</p>
      </InfoSection>

      <InfoSection title="I cannot complete checkout">
        <p>Confirm that the cart has available products, a saved delivery address is selected, and the chosen payment provider is available. If a previous checkout is saved, check its status before creating another payment.</p>
      </InfoSection>

      <InfoSection title="A payment completed but the order is not paid">
        <p>Keep the payment-provider reference and FastStore order reference. Refresh the payment-status page once. Webhook and reconciliation processing may update the order shortly after the provider confirms it.</p>
        <InfoCallout>
          FastStore will never ask for your password, card PIN, PayPal password, or M-Pesa PIN to investigate an order.
        </InfoCallout>
      </InfoSection>

      <InfoSection title="Returns and product support">
        <p>Read <Link to="/shipping-returns" className="font-semibold text-primary underline">Shipping & Returns</Link> before sending a product, and check <Link to="/warranty" className="font-semibold text-primary underline">Warranty Information</Link> for defective products.</p>
      </InfoSection>
    </InformationLayout>
  );
}
