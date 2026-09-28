import { Link } from "react-router-dom";
import InformationLayout, { InfoCallout, InfoList, InfoSection } from "../components/InformationLayout";

export default function PrivacyPolicy() {
  return (
    <InformationLayout
      title="Privacy Policy"
      intro="This policy explains what FastStore collects, why it is used, and the choices available to shoppers."
    >
      <InfoSection title="Information we collect">
        <InfoList>
          <li>Account details such as your name, email address, phone number, and verification status.</li>
          <li>Saved delivery addresses and the address snapshot attached to an order.</li>
          <li>Cart, wishlist, order, payment-status, and customer-service information.</li>
          <li>Technical request information needed for security, fraud prevention, and reliable operation.</li>
        </InfoList>
        <p>FastStore does not store complete card details, PayPal passwords, or M-Pesa PINs.</p>
      </InfoSection>

      <InfoSection title="How we use information">
        <InfoList>
          <li>Create and secure accounts, maintain sessions, and recover access.</li>
          <li>Price products, reserve stock, process checkout, deliver orders, and provide order history.</li>
          <li>Send account-verification and order-confirmation messages.</li>
          <li>Prevent abuse, investigate errors, and meet legal or accounting obligations.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Payments and service providers">
        <p>Payment instructions are handled by the payment provider selected at checkout: Stripe, PayPal, or Safaricom M-Pesa. FastStore receives identifiers and payment status needed to match the payment to an order.</p>
        <p>We may also share the minimum necessary information with hosting, database, email, delivery, security, and infrastructure providers that operate the store.</p>
      </InfoSection>

      <InfoSection title="Retention and your choices">
        <p>Account and order records are retained while needed to provide the service, resolve disputes, prevent fraud, and satisfy legal or accounting requirements. Browser storage can be cleared from <Link to="/cookies" className="font-semibold text-primary underline">Cookie Settings</Link>.</p>
        <p>You may update saved addresses, remove cart or wishlist items, and sign out through the storefront. Order records may be retained after account use because they document completed transactions.</p>
      </InfoSection>

      <InfoSection title="Security and policy changes">
        <p>We use access controls, secure cookies, HTTPS deployment, signed payment webhooks, and server-side validation. No online service can promise absolute security; shoppers should use a unique password and protect their email account.</p>
        <InfoCallout>
          Review the <Link to="/security" className="font-semibold text-primary underline">Security Overview</Link> for practical account and payment-safety guidance.
        </InfoCallout>
        <p>Material changes to this policy will be reflected on this page with a revised update date.</p>
      </InfoSection>
    </InformationLayout>
  );
}
