import InformationLayout, { InfoList, InfoSection } from "../components/InformationLayout";

export default function WarrantyInfo() {
  return (
    <InformationLayout
      title="Warranty Information"
      intro="Warranty coverage depends on the product listing, manufacturer terms, and applicable consumer law."
    >
      <InfoSection title="What may be covered">
        <p>Where a product listing or manufacturer documentation includes a warranty, it generally applies to defects in materials or workmanship during the stated coverage period.</p>
        <p>FastStore does not add a separate manufacturer warranty when none is described, but statutory consumer protections continue to apply where required.</p>
      </InfoSection>

      <InfoSection title="What is generally excluded">
        <InfoList>
          <li>Normal wear, cosmetic change, or consumable parts reaching the end of their expected life.</li>
          <li>Accidental damage, misuse, unsuitable storage, liquid exposure, or unauthorized repair.</li>
          <li>Damage caused by incompatible accessories, power sources, software, or modification.</li>
          <li>Lost products, removed serial numbers, or claims without enough purchase information.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Preparing a warranty request">
        <InfoList>
          <li>Locate the FastStore order reference and delivery date.</li>
          <li>Describe the fault, when it began, and troubleshooting already attempted.</li>
          <li>Keep serial numbers, original accessories, and photographs or video that show the issue.</li>
          <li>Back up and remove personal data before sending an electronic device for inspection.</li>
        </InfoList>
      </InfoSection>

      <InfoSection title="Assessment and remedy">
        <p>The product may need inspection before a remedy is approved. Depending on the issue, stock, applicable warranty, and consumer law, the remedy may be repair, replacement, store-supported resolution, or refund.</p>
        <p>Do not ship a product until return instructions and the correct destination have been confirmed.</p>
      </InfoSection>
    </InformationLayout>
  );
}
