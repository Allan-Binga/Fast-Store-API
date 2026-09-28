import { Link } from "react-router-dom";
import InformationLayout, { InfoList, InfoSection } from "../components/InformationLayout";

export default function TermsOfService() {
  return (
    <InformationLayout
      title="Terms of Service"
      intro="These terms govern use of the FastStore storefront, customer accounts, and purchases."
    >
      <InfoSection title="Using FastStore">
        <p>You must provide accurate information, use the store lawfully, and protect your account credentials. You are responsible for activity performed through your account until you report or secure unauthorized access.</p>
        <InfoList>
          <li>Do not interfere with the storefront, probe accounts, automate abusive traffic, or attempt unauthorized access.</li>
          <li>Do not submit false payment, identity, delivery, or order information.</li>
          <li>Products may not be purchased through abusive or fraudulent means.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Products, pricing, and availability">
        <p>Product descriptions and images are provided to help shoppers make decisions. Minor visual differences may occur. Prices, promotions, and stock can change before checkout.</p>
        <p>FastStore verifies current pricing and availability during checkout. Placing an item in a cart does not reserve it. Stock is reserved only when the checkout process creates an eligible pending order.</p>
      </InfoSection>

      <InfoSection title="Orders and payment">
        <p>An order is accepted when payment is confirmed and the order is recorded as paid. A checkout attempt may expire or be cancelled if payment is not confirmed, stock is unavailable, or required information is invalid.</p>
        <p>Payments are processed through Stripe, PayPal, or Safaricom M-Pesa under the selected provider’s terms. Do not submit the same payment repeatedly while an earlier attempt is pending; use the payment-status page or order history first.</p>
      </InfoSection>

      <InfoSection title="Delivery, returns, and refunds">
        <p>Delivery estimates and return eligibility are governed by the <Link to="/shipping-returns" className="font-semibold text-primary underline">Shipping & Returns Policy</Link>. Approved refunds are returned through the original payment route when supported by the provider.</p>
      </InfoSection>

      <InfoSection title="Store availability and responsibility">
        <p>We work to keep FastStore accurate and available, but maintenance, provider outages, network failures, and events outside reasonable control can interrupt service. Nothing in these terms removes consumer rights that cannot legally be limited.</p>
        <p>FastStore content, branding, and storefront code may not be copied or redistributed without permission, except where applicable law or an open-source license allows it.</p>
      </InfoSection>

      <InfoSection title="Changes">
        <p>We may update these terms when store features, payment methods, or legal requirements change. The current version and update date will remain available on this page.</p>
      </InfoSection>
    </InformationLayout>
  );
}
