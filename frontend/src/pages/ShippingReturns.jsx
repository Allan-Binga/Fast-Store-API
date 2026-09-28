import { Link } from "react-router-dom";
import InformationLayout, { InfoCallout, InfoList, InfoSection } from "../components/InformationLayout";

export default function ShippingReturns() {
  return (
    <InformationLayout
      title="Shipping & Returns"
      intro="How FastStore prepares deliveries, handles order issues, and evaluates return and refund requests."
    >
      <InfoSection title="Order processing and delivery">
        <p>Paid orders enter processing after the payment provider confirms payment. Delivery timing depends on the destination, product availability, carrier operation, and any address issue.</p>
        <InfoList>
          <li>Review your saved delivery address before paying.</li>
          <li>Use <Link to="/orders" className="font-semibold text-primary underline">Your Orders</Link> to confirm payment and order status.</li>
          <li>A payment confirmation is not a carrier-delivery guarantee or an exact arrival time.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Return window">
        <p>Return requests should be made within 30 calendar days after delivery. Products should be unused, complete, and returned with their original accessories and packaging where reasonably possible.</p>
        <p>Personalized goods, hygiene-sensitive goods after opening, downloadable goods, and products damaged through misuse may be ineligible unless required otherwise by applicable consumer law.</p>
      </InfoSection>

      <InfoSection title="Damaged, incorrect, or missing items">
        <p>Inspect the parcel promptly. Keep the packaging and order reference, and document visible damage or an incorrect item. These details help distinguish a fulfillment issue from carrier damage and speed up review.</p>
        <InfoCallout>
          Never make a second payment to fix an order issue. First confirm the existing transaction in <Link to="/orders" className="font-semibold text-primary underline">Your Orders</Link>.
        </InfoCallout>
      </InfoSection>

      <InfoSection title="Refunds">
        <p>Approved refunds are issued to the original payment method where the provider supports it. Bank, card, PayPal, and mobile-money processing times vary after FastStore submits the refund.</p>
        <p>Original delivery charges are normally non-refundable unless the return results from an incorrect, defective, or damaged delivery. Return-delivery costs may be deducted when the return is based on preference rather than a store error.</p>
      </InfoSection>

      <InfoSection title="Before returning anything">
        <InfoList>
          <li>Locate the order reference and payment status.</li>
          <li>Do not send an item without return instructions and a confirmed destination.</li>
          <li>Remove personal data from electronics and retain your own backups.</li>
          <li>Package the item securely and keep shipment evidence.</li>
        </InfoList>
      </InfoSection>
    </InformationLayout>
  );
}
