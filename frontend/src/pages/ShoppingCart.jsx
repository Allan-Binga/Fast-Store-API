import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import Footer from "../components/Footer";
import ProductImage from "../components/ProductImage";
import ProductCard from "../components/ProductCard";
import Modal from "../components/Modal";
import useResource from "../hooks/useResource";
import { useStore } from "../store/context";
import { money } from "../store/catalog";

function RecentProduct({ id }) {
  const resource = useResource(`/products/${id}`);
  const navigate = useNavigate();
  return resource.data ? (
    <ProductCard
      product={resource.data}
      onView={(productId) => navigate(`/products/${productId}`)}
    />
  ) : null;
}

function CartItem({ item }) {
  const { mutate, wishlist, isPending } = useStore();
  const quantityActionKey = "cart:quantity:" + item.productId;
  const removeActionKey = "cart:remove:" + item.productId;
  const wishlistActionKey = "wishlist:" + item.productId;
  const quantityPending = isPending(quantityActionKey);
  const removePending = isPending(removeActionKey);
  const wishlistPending = isPending(wishlistActionKey);
  const saved = wishlist.some((product) => product._id === item.productId);
  function quantity(value) {
    void mutate(
      {
        method: "patch",
        url: "/cart/quantity",
        data: { productId: item.productId, quantity: value },
      },
      "Quantity updated.",
      undefined,
      quantityActionKey,
    );
  }
  return (
    <article
      aria-label={item.name}
      className="grid grid-cols-2 items-center gap-4 p-4 transition-colors hover:bg-surface/50 sm:p-6 md:grid-cols-12"
    >
      <div className="col-span-2 flex min-w-0 items-start gap-4 md:col-span-5">
        <Link
          to={`/products/${item.productId}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-sm border border-outline-variant/50 bg-surface-container-low"
        >
          <ProductImage
            src={item.image}
            alt={item.name}
            className="h-full w-full object-contain"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-title-card text-title-card font-semibold leading-tight">
            <Link
              to={`/products/${item.productId}`}
              className="hover:text-primary"
            >
              {item.name}
            </Link>
          </h2>
          <p
            className={`mt-1 text-caption ${item.available === false ? "text-error" : "text-outline"}`}
          >
            {item.available === false
              ? "This quantity is unavailable. Reduce it or remove the item."
              : "Available"}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-label-sm">
            <button
              type="button"
              disabled={wishlistPending || saved}
              onClick={() =>
                mutate(
                  {
                    method: "post",
                    url: "/wishlist/add-to-wishlist",
                    data: { productId: item.productId },
                  },
                  "Saved to your wishlist. The item is still in your cart.",
                  undefined,
                  wishlistActionKey,
                )
              }
              className="text-primary hover:underline disabled:opacity-50"
            >
              {saved ? "Saved to wishlist" : "Save to wishlist"}
            </button>
            <button
              type="button"
              disabled={removePending}
              onClick={() =>
                mutate(
                  {
                    method: "delete",
                    url: "/cart/remove",
                    data: { productId: item.productId },
                  },
                  "Product removed from your cart.",
                  undefined,
                  removeActionKey,
                )
              }
              className="text-error hover:underline disabled:opacity-50"
            >
              {removePending ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
      <div className="text-sm md:col-span-2 md:text-right">
        <span className="mr-2 text-caption text-outline md:hidden">
          Unit price
        </span>
        {money(item.price)}
      </div>
      <div className="flex justify-end md:col-span-3 md:justify-center">
        <div className="inline-flex h-9 items-center rounded-sm border border-outline-variant bg-white">
          <button
            type="button"
            aria-label={`Decrease quantity of ${item.name}`}
            disabled={quantityPending || item.quantity <= 1}
            onClick={() => quantity(item.quantity - 1)}
            className="h-full w-8 rounded-l-sm text-outline hover:bg-surface-container-low disabled:opacity-40"
          >
            −
          </button>
          <span
            aria-label={`Quantity of ${item.name}: ${item.quantity}`}
            className="w-9 text-center text-sm font-semibold"
          >
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label={`Increase quantity of ${item.name}`}
            disabled={
              quantityPending || item.quantity >= 999 || item.available === false
            }
            onClick={() => quantity(item.quantity + 1)}
            className="h-full w-8 rounded-r-sm text-outline hover:bg-surface-container-low disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>
      <div className="col-span-2 text-right md:col-span-2">
        <span className="mr-2 text-caption text-outline md:hidden">
          Subtotal
        </span>
        <span className="font-price-md text-price-md font-bold">
          {money((Math.round(item.price * 100) * item.quantity) / 100)}
        </span>
      </div>
    </article>
  );
}

export default function ShoppingCart() {
  const {
    session,
    cart,
    errors,
    loading,
    refreshShopping,
    isPending,
    checkSession,
    mutate,
  } = useStore();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recent] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem("faststore.recent") || "[]");
      return Array.isArray(ids)
        ? [
            ...new Set(
              ids.filter(
                (id) => typeof id === "string" && /^[a-f\d]{24}$/i.test(id),
              ),
            ),
          ].slice(0, 4)
        : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    const previous = document.title;
    document.title = "Shopping cart — FastStore";
    return () => {
      document.title = previous;
    };
  }, []);
  async function refreshCart() {
    if (refreshing) return;

    setRefreshing(true);
    try {
      await refreshShopping();
    } finally {
      setRefreshing(false);
    }
  }

  const authenticated = session.status === "authenticated";
  const clearPending = isPending("cart:clear");
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const subtotal =
    cart.reduce(
      (total, item) => total + Math.round(item.price * 100) * item.quantity,
      0,
    ) / 100;
  const unavailable = cart.some((item) => item.available === false);
  const recentIds = recent.filter(
    (id) => !cart.some((item) => item.productId === id),
  );
  return (
    <div className="flex min-h-screen flex-col bg-surface font-body-md text-on-surface">
      <TopNavbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant pb-4">
          <div className="flex flex-wrap items-baseline gap-3">
            <h1 className="font-headline-lg text-headline-lg">Shopping Cart</h1>
            {authenticated && !errors.cart && (
              <span className="text-body-lg text-outline">
                ({count} {count === 1 ? "item" : "items"})
              </span>
            )}
          </div>
          {authenticated && (
            <button
              disabled={refreshing}
              onClick={refreshCart}
              className="rounded-sm border border-outline-variant bg-white px-4 py-2 text-sm text-primary disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh cart"}
            </button>
          )}
        </div>
        {session.status === "checking" ? (
          <p
            role="status"
            className="rounded-md border border-outline-variant bg-white p-6"
          >
            Loading your cart…
          </p>
        ) : !authenticated ? (
          <section className="mx-auto max-w-md space-y-4 rounded-sm border border-outline-variant bg-white p-8 text-center shadow-sm">
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[40px] text-primary"
            >
              shopping_bag
            </span>
            <h2 className="font-headline-md text-headline-md">
              {session.status === "error"
                ? "We could not load your account"
                : "Sign in to view your cart"}
            </h2>
            <p className="text-on-surface-variant">
              Your cart is saved to your account. You can keep browsing without
              signing in.
            </p>
            {session.status === "error" && (
              <button onClick={checkSession} className="text-primary underline">
                Try again
              </button>
            )}
            <Link
              to="/login"
              className="block rounded-sm bg-primary-container px-5 py-3 font-semibold text-white"
            >
              Sign in
            </Link>
            <Link to="/" className="inline-block text-primary hover:underline">
              Continue shopping
            </Link>
          </section>
        ) : (
          <>
            {loading && !cart.length ? (
              <p
                role="status"
                className="rounded-md border border-outline-variant bg-white p-6"
              >
                Loading your cart...
              </p>
            ) : errors.cart ? (
              <div
                role="alert"
                className="space-y-3 rounded-md border border-error/20 bg-error-container/40 p-5"
              >
                <h2 className="font-semibold text-error">
                  Could not load your cart
                </h2>
                <p>{errors.cart}</p>
                <button
                  onClick={refreshCart}
                  disabled={refreshing}
                  className="rounded-sm border border-outline-variant bg-white px-4 py-2 text-primary disabled:opacity-50"
                >
                  Try again
                </button>
              </div>
            ) : cart.length ? (
              <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                <div className="space-y-4 lg:col-span-8">
                  <div
                    className="overflow-hidden rounded-md border border-outline-variant bg-white shadow-sm"
                  >
                    <div className="hidden grid-cols-12 gap-4 border-b border-outline-variant bg-surface-container-low px-6 py-3.5 text-label-sm font-semibold uppercase tracking-wider text-outline md:grid">
                      <div className="col-span-5">Product</div>
                      <div className="col-span-2 text-right">Unit price</div>
                      <div className="col-span-3 text-center">Quantity</div>
                      <div className="col-span-2 text-right">Subtotal</div>
                    </div>
                    <div className="divide-y divide-outline-variant/60">
                      {cart.map((item) => (
                        <CartItem key={item.productId} item={item} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to="/"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      ← Continue shopping
                    </Link>
                    <button
                      onClick={() => setConfirmClear(true)}
                      className="text-sm text-error hover:underline disabled:opacity-50"
                    >
                      Clear cart
                    </button>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-outline-variant/60 bg-surface-container-low p-4 text-caption text-on-surface-variant">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[18px] text-primary"
                    >
                      info
                    </span>
                    <p>
                      Adding items to your cart does not reserve stock. Prices
                      and availability are checked again at checkout.
                    </p>
                  </div>
                </div>
                <aside
                  aria-labelledby="summary-title"
                  className="rounded-md border border-outline-variant bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:col-span-4"
                >
                  <h2
                    id="summary-title"
                    className="border-b border-outline-variant pb-4 font-headline-sm text-headline-sm font-semibold"
                  >
                    Order Summary
                  </h2>
                  <div className="space-y-3 border-b border-outline-variant py-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-outline">Items</span>
                      <span>{count}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-outline">Subtotal</span>
                      <span className="font-semibold">{money(subtotal)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 py-5">
                    <span className="font-semibold">Estimated subtotal</span>
                    <strong className="font-price-lg text-price-lg text-primary">
                      {money(subtotal)}
                    </strong>
                  </div>
                  {unavailable && (
                    <p
                      role="alert"
                      className="mb-4 rounded-sm bg-error-container/30 p-3 text-sm text-error"
                    >
                      Some items are unavailable in the requested quantity.
                      Reduce their quantities or remove them. Their displayed
                      prices may be out of date.
                    </p>
                  )}
                  <button
                    disabled={unavailable}
                    onClick={() => navigate("/checkout")}
                    className="min-h-12 w-full rounded-sm bg-primary-container px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    Proceed to checkout
                  </button>
                  <p className="mt-3 text-caption text-outline">
                    Choose your shipping address and review your purchase before
                    continuing to Stripe.
                  </p>
                </aside>
              </div>
            ) : (
              !loading && (
                <section className="mx-auto max-w-md space-y-4 rounded-sm border border-outline-variant bg-white p-8 text-center shadow-sm">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-md bg-surface-container-low">
                    <span
                      aria-hidden="true"
                      className="material-symbols-outlined text-[40px] text-outline"
                    >
                      shopping_bag
                    </span>
                  </div>
                  <h2 className="font-headline-md text-headline-md font-bold">
                    Your cart is currently empty
                  </h2>
                  <p className="text-on-surface-variant">
                    Explore the store to find your next everyday favorite.
                  </p>
                  <Link
                    to="/"
                    className="inline-block rounded-sm bg-primary-container px-6 py-3 font-semibold text-white"
                  >
                    Continue shopping
                  </Link>
                </section>
              )
            )}
          </>
        )}
        {recentIds.length > 0 && (
          <section className="mt-10 space-y-5 border-t border-outline-variant pt-8">
            <div>
              <h2 className="font-headline-md text-headline-md">
                Recently Viewed
              </h2>
              <p className="mt-1 text-caption text-outline">
                Products you recently explored.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {recentIds.map((id) => (
                <RecentProduct key={id} id={id} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
      {confirmClear && (
        <Modal title="Clear your cart?" onClose={() => setConfirmClear(false)}>
          <p className="mb-6 text-on-surface-variant">
            This removes all items from your cart. Your wishlist is kept.
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <button
                onClick={() => setConfirmClear(false)}
              className="rounded-sm border border-outline-variant px-4 py-2"
            >
              Keep shopping
            </button>
            <button
              disabled={clearPending}
              onClick={() => {
                void mutate(
                  { method: "delete", url: "/cart/clear" },
                  "Cart cleared.",
                  undefined,
                  "cart:clear",
                ).then(() => setConfirmClear(false));
              }}
              className="rounded-sm bg-error px-4 py-2 font-semibold text-white disabled:opacity-50"
            >
              Yes, clear cart
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
