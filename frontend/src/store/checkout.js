function storageKey(user) {
  return `faststore.checkout.${user._id || user.email}`;
}

function isStoredAttempt(value) {
  return Boolean(
    value?.key &&
      value.body?.addressId &&
      Array.isArray(value.body.items),
  );
}

export function checkoutStorageKey(user) {
  return storageKey(user);
}

export function readCheckoutAttempt(user) {
  try {
    const attempt = JSON.parse(sessionStorage.getItem(storageKey(user)));
    return isStoredAttempt(attempt) ? attempt : null;
  } catch {
    // Private browsing, storage quotas, or manual browser changes can make
    // sessionStorage unavailable. Checkout creation reports the actionable error.
    return null;
  }
}

export function saveCheckoutAttempt(user, attempt) {
  sessionStorage.setItem(storageKey(user), JSON.stringify(attempt));
}

export function clearCheckoutAttempt(user, key) {
  if (readCheckoutAttempt(user)?.key === key) {
    sessionStorage.removeItem(storageKey(user));
  }
}

export function paymentMoney(value, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(Number(value) || 0);
}
