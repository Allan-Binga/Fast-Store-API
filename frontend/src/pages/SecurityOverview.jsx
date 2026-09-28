import { Link } from "react-router-dom";
import InformationLayout, { InfoCallout, InfoList, InfoSection } from "../components/InformationLayout";

export default function SecurityOverview() {
  return (
    <InformationLayout
      title="Security Overview"
      intro="FastStore combines browser, server, database, and payment-provider controls to protect accounts and purchases."
    >
      <InfoSection title="Account and session protection">
        <InfoList>
          <li>Email verification is required before normal account use.</li>
          <li>Authentication tokens are held in secure, HttpOnly cookies rather than exposed to page scripts.</li>
          <li>Password-reset links expire, and session credentials are cleared after a password change.</li>
          <li>Rate limits reduce automated abuse against account and messaging endpoints.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Checkout and payment protection">
        <InfoList>
          <li>Prices and stock are resolved on the server instead of trusted from browser values.</li>
          <li>Checkout requests use idempotency keys to reduce duplicate order creation.</li>
          <li>Stripe, PayPal, and M-Pesa confirmations are verified server-side before an order is marked paid.</li>
          <li>Signed webhooks and payment reconciliation help recover delayed provider updates.</li>
        </InfoList>
        <p>FastStore does not collect complete card details, PayPal passwords, or M-Pesa PINs.</p>
      </InfoSection>

      <InfoSection title="How shoppers can stay safe">
        <InfoList>
          <li>Use a unique password and protect the email account connected to FastStore.</li>
          <li>Check the site address and HTTPS connection before entering account information.</li>
          <li>Never share one-time codes, passwords, card PINs, or mobile-money PINs.</li>
          <li>Review <Link to="/orders" className="font-semibold text-primary underline">Your Orders</Link> before responding to an unexpected payment message.</li>
          <li>Sign out on shared devices and reset your password if account activity looks unfamiliar.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Security limitations">
        <p>No internet service can guarantee that every risk is eliminated. Payment-provider, email, carrier, device, and network security also affect the safety of a purchase.</p>
        <InfoCallout>
          A legitimate FastStore flow will not ask you to send payment credentials through chat, email, or a product review.
        </InfoCallout>
      </InfoSection>
    </InformationLayout>
  );
}
