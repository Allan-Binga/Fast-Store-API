import { useState } from "react";
import InformationLayout, { InfoCallout, InfoList, InfoSection } from "../components/InformationLayout";

function removeCheckoutStorage() {
  const keys = [];
  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith("faststore.checkout.")) keys.push(key);
  }
  keys.forEach((key) => sessionStorage.removeItem(key));
}

export default function CookieSettings() {
  const [message, setMessage] = useState("");

  function clearRecentlyViewed() {
    try {
      localStorage.removeItem("faststore.recent");
      setMessage("Recently viewed products were cleared from this browser.");
    } catch {
      setMessage("This browser did not allow FastStore to change local storage.");
    }
  }

  function clearCheckoutAttempts() {
    try {
      removeCheckoutStorage();
      setMessage("Saved checkout attempts were cleared from this browser tab.");
    } catch {
      setMessage("This browser did not allow FastStore to change session storage.");
    }
  }

  return (
    <InformationLayout
      title="Cookie Settings"
      intro="Review the cookies and browser storage FastStore uses, and clear optional shopping information on this device."
    >
      {message && <p role="status" className="rounded-md bg-surface-container-high p-4 text-primary">{message}</p>}

      <InfoSection title="Essential authentication cookies">
        <p>FastStore uses secure, HttpOnly access and refresh cookies to keep a verified shopper signed in and to renew an eligible session. Page scripts cannot read these cookie values.</p>
        <InfoCallout>Authentication cookies are required for cart, wishlist, address, checkout, and order features. Use Sign out to end the active account session.</InfoCallout>
      </InfoSection>

      <InfoSection title="Recently viewed products">
        <p>The browser stores a short list under <code className="rounded bg-surface-container-low px-1.5 py-0.5 text-sm">faststore.recent</code> so recently viewed products can appear again. It remains on this browser until cleared or replaced.</p>
        <button onClick={clearRecentlyViewed} className="rounded-sm border border-outline-variant px-4 py-2 font-semibold text-primary hover:bg-surface-container-low">
          Clear recently viewed products
        </button>
      </InfoSection>

      <InfoSection title="Saved checkout attempt">
        <p>The current browser tab uses session storage for an in-progress checkout key, selected address, provider, and product references. This prevents accidental duplicate checkout creation and normally disappears when the tab session ends.</p>
        <button onClick={clearCheckoutAttempts} className="rounded-sm border border-outline-variant px-4 py-2 font-semibold text-primary hover:bg-surface-container-low">
          Clear saved checkout attempts
        </button>
      </InfoSection>

      <InfoSection title="Third-party payment services">
        <p>Stripe, PayPal, or Safaricom may use their own cookies or storage when their hosted payment experience opens. Their privacy and cookie controls apply within those services.</p>
      </InfoSection>

      <InfoSection title="What FastStore does not currently use">
        <InfoList>
          <li>No FastStore advertising or cross-site tracking cookie is intentionally installed by this storefront.</li>
          <li>No analytics preference cookie is currently required by the storefront.</li>
        </InfoList>
        <p>Browser controls can block or delete storage, but doing so may sign you out or interrupt checkout.</p>
      </InfoSection>
    </InformationLayout>
  );
}
