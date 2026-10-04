import { useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../store/context";
import { available, money } from "../store/catalog";
import Skeleton from "./Skeleton";
import Modal from "./Modal";
import ProductImage from "./ProductImage";
import LiveSearch from "./LiveSearch";
import SignInLink from "./SignInLink";

function Icon({ children, className = "" }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
      {children}
    </span>
  );
}

function closeDetailsMenu(event) {
  const menu = event.currentTarget.closest("details");
  if (menu) menu.open = false;
}

function closeOnBlur(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    event.currentTarget.open = false;
  }
}

function BrandLink() {
  return (
    <Link
      to="/"
      className="shrink-0 font-headline-md text-headline-md font-extrabold tracking-tight text-primary"
    >
      FastStore
    </Link>
  );
}

function CategoryLink({ name, active, onClick }) {
  return (
    <Link
      title={name}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      to={`/?${new URLSearchParams({ category: name })}#featured`}
      className={`min-w-0 truncate py-1 text-xs font-semibold text-primary hover:text-secondary sm:text-sm xl:max-w-24 ${
        active ? "border-b-2 border-primary" : ""
      }`}
    >
      {name}
    </Link>
  );
}

function CategoryMenu({ categories, activeCategory }) {
  const names = categories.data || [];
  const primaryCategories = names.slice(0, 4);

  return (
    <nav
      aria-label="Product categories"
      className="order-3 flex w-full min-w-0 items-center gap-3 xl:order-none xl:w-auto xl:max-w-[390px]"
    >
      {categories.loading && (
        <span role="status" aria-label="Loading categories" className="flex gap-2"><span className="sr-only">Loading categories…</span>{[0, 1, 2].map(item => <span key={item} aria-hidden="true" className="h-4 w-16 animate-pulse rounded-sm bg-surface-container-high" />)}</span>
      )}
      {categories.error && (
        <button className="text-xs text-error underline" onClick={categories.retry}>
          Retry categories
        </button>
      )}

      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 xl:justify-start">
        {primaryCategories.map((name) => (
          <CategoryLink key={name} name={name} active={activeCategory === name} />
        ))}
      </div>

      <details className="relative shrink-0" onBlur={closeOnBlur}>
        <summary
          aria-label="More categories"
          className="flex cursor-pointer list-none items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold text-primary hover:bg-surface-container-low [&::-webkit-details-marker]:hidden"
        >
          More
          <Icon className="text-[18px]">expand_more</Icon>
        </summary>
        <div className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-outline-variant bg-white p-2 ">
          <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-outline">
            Shop by category
          </p>
          <Link
            onClick={closeDetailsMenu}
            to="/#featured"
            className="block rounded-sm px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low"
          >
            All products
          </Link>
          <div className="max-h-72 overflow-y-auto">
            {names.map((name) => (
              <Link
                key={name}
                onClick={closeDetailsMenu}
                aria-current={activeCategory === name ? "page" : undefined}
                to={`/?${new URLSearchParams({ category: name })}#featured`}
                className={`block break-words rounded-sm px-3 py-2 text-sm text-primary hover:bg-surface-container-low ${
                  activeCategory === name ? "bg-surface-container-low font-semibold" : ""
                }`}
              >
                {name}
              </Link>
            ))}
          </div>
        </div>
      </details>
    </nav>
  );
}

function SearchArea({ query, onView }) {
  return (
    <div className="order-2 w-full min-w-0 md:order-none md:w-auto md:flex-1 xl:min-w-48">
      <LiveSearch key={query} query={query} onView={onView} />
    </div>
  );
}

function WishlistButton({ wishlistReady, wishlistCount, openWishlist }) {
  return (
    <button
      onClick={openWishlist}
      aria-label="Open wishlist"
      className="relative flex min-h-11 min-w-11 items-center justify-center rounded-sm p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-low"
    >
      <Icon className="text-[22px]">favorite</Icon>
      {wishlistReady && wishlistCount > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-0.5 text-[10px] font-bold text-white">
          {wishlistCount}
        </span>
      )}
    </button>
  );
}

function CartButton({ cartReady, cartCount, openCart }) {
  return (
    <button
      onClick={openCart}
      aria-label="Open cart"
      className="flex items-center gap-1.5 rounded-sm border border-outline-variant/60 bg-surface-container-low px-2.5 py-2 text-primary hover:bg-surface-container-high"
    >
      <Icon className="text-[22px]">shopping_bag</Icon>
      <span className="hidden text-sm font-semibold sm:inline">Bag</span>
      {cartReady && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white">
          {cartCount}
        </span>
      )}
    </button>
  );
}

function AccountMenuItem({ children, icon, to, disabled, onClick, className = "" }) {
  const styles = `flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-surface-container-low disabled:opacity-50 ${className}`;

  if (to) {
    return (
      <Link to={to} onClick={closeDetailsMenu} className={styles}>
        {icon && <Icon className="text-[18px]">{icon}</Icon>}
        {children}
      </Link>
    );
  }

  return (
    <button disabled={disabled} onClick={onClick} className={styles}>
      {icon && <Icon className="text-[18px]">{icon}</Icon>}
      {children}
    </button>
  );
}

function SignedInAccountMenu({ session, logoutPending, openWishlist, navigate, logout }) {
  return (
    <>
      <p className="break-all border-b border-outline-variant/60 px-3 py-3 text-xs text-outline">
        Signed in as
        <br />
        <span className="font-medium text-on-surface">{session.user.email}</span>
      </p>
      <AccountMenuItem
        icon="favorite"
        onClick={(event) => {
          closeDetailsMenu(event);
          openWishlist();
        }}
      >
        Your wishlist
      </AccountMenuItem>
      <AccountMenuItem to="/wallet" icon="account_balance_wallet">
        Wallet & add funds
      </AccountMenuItem>
      <AccountMenuItem to="/orders" icon="receipt_long">
        Your orders
      </AccountMenuItem>
      <AccountMenuItem to="/deliveries" icon="local_shipping">
        Your deliveries
      </AccountMenuItem>
      <AccountMenuItem to="/refunds" icon="currency_exchange">
        Refunds
      </AccountMenuItem>
      <AccountMenuItem
        icon="shopping_bag"
        onClick={(event) => {
          closeDetailsMenu(event);
          navigate("/cart");
        }}
      >
        Your cart
      </AccountMenuItem>
      <AccountMenuItem to="/account/addresses" icon="location_on">
        Saved addresses
      </AccountMenuItem>
      <AccountMenuItem
        disabled={logoutPending}
        icon="logout"
        className="font-semibold text-error hover:bg-error-container/30"
        onClick={(event) => {
          closeDetailsMenu(event);
          void logout();
        }}
      >
        {logoutPending ? "Please wait..." : "Log out"}
      </AccountMenuItem>
    </>
  );
}

function SignedOutAccountMenu() {
  return (
    <>
      <SignInLink
        onClick={closeDetailsMenu}
        className="block rounded-sm px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-container-low"
      >
        Sign in
      </SignInLink>
      <Link
        onClick={closeDetailsMenu}
        to="/register"
        className="block rounded-sm px-3 py-2 text-sm hover:bg-surface-container-low"
      >
        Create account
      </Link>
    </>
  );
}

function AccountMenu({ session, logoutPending, openWishlist, navigate, logout }) {
  const signedIn = session.status === "authenticated";

  return (
    <details className="relative" onBlur={closeOnBlur}>
      <summary
        aria-label="Account"
        className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-1.5 rounded-sm p-2 text-on-surface-variant hover:bg-surface-container-low [&::-webkit-details-marker]:hidden"
      >
        <Icon className="text-[22px]">account_circle</Icon>
        <span className="hidden text-sm font-medium sm:inline">
          {signedIn ? "Account" : "Sign in"}
        </span>
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-2rem)] space-y-1 rounded-md border border-outline-variant bg-white p-2 ">
        {session.status === "checking" ? (
          <div role="status" aria-label="Checking session" className="space-y-3 p-3"><span className="sr-only">Checking session…</span>{[0, 1, 2].map(item => <div key={item} aria-hidden="true" className="h-4 w-full animate-pulse rounded-sm bg-surface-container-high" />)}</div>
        ) : signedIn ? (
          <SignedInAccountMenu
            session={session}
            logoutPending={logoutPending}
            openWishlist={openWishlist}
            navigate={navigate}
            logout={logout}
          />
        ) : (
          <SignedOutAccountMenu />
        )}
      </div>
    </details>
  );
}

function WalletBalance() {
  const { wallet } = useStore();
  const cents = wallet.balances.find(balance => balance.currency === "usd")?.balanceCents || 0;
  return <Link to="/wallet" aria-label={wallet.error ? "Wallet balance unavailable" : wallet.loading ? "Loading wallet balance" : `Wallet balance ${money(cents / 100)}`} className="flex min-h-11 items-center gap-1.5 rounded-sm border border-outline-variant/60 px-2 py-2 text-primary sm:px-3">
    <Icon className="text-[20px]">account_balance_wallet</Icon>
    {wallet.loading ? <span aria-hidden="true" className="h-4 w-12 animate-pulse rounded-sm bg-surface-container-high" /> : <span className="text-xs font-bold sm:text-sm">{wallet.error ? "—" : money(cents / 100)}</span>}
  </Link>;
}

function HeaderActions({
  session,
  logoutPending,
  cartReady,
  cartCount,
  wishlistReady,
  wishlistCount,
  openWishlist,
  navigate,
  logout,
}) {
  return (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {session.status === "authenticated" && <WalletBalance />}
      <WishlistButton
        wishlistReady={wishlistReady}
        wishlistCount={wishlistCount}
        openWishlist={openWishlist}
      />
      <AccountMenu
        session={session}
        logoutPending={logoutPending}
        openWishlist={openWishlist}
        navigate={navigate}
        logout={logout}
      />
      <CartButton cartReady={cartReady} cartCount={cartCount} openCart={() => navigate("/cart")} />
    </div>
  );
}

function GuestPanel({ session, checkSession, closePanel }) {
  const message =
    session.status === "error"
      ? "We could not check your account. You can still browse the store."
      : "Sign in to save products and manage your cart. You can browse all products without an account.";

  return (
    <div className="space-y-4">
      <p>{message}</p>
      <Link to="/register" onClick={closePanel} className="inline-block rounded-sm bg-primary px-4 py-2 text-white">
        Create account
      </Link>
      <SignInLink onClick={closePanel} className="ml-3 inline-block text-primary underline">
        Sign in
      </SignInLink>
      <button className="rounded-sm bg-primary px-4 py-2 text-white" onClick={checkSession}>
        Check session again
      </button>
      <button className="ml-3 underline" onClick={closePanel}>
        Continue browsing
      </button>
    </div>
  );
}

function AccountPanel({ session, logoutPending, logout }) {
  return (
    <div className="space-y-4">
      <p>Signed in as {session.user.email}</p>
      <button
        disabled={logoutPending}
        onClick={logout}
        className="rounded-sm border border-outline-variant px-4 py-2 disabled:opacity-50"
      >
        {logoutPending ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}

function CartQuantityControls({ item, isPending, mutate }) {
  const quantityActionKey = "cart:quantity:" + item.productId;
  const removeActionKey = "cart:remove:" + item.productId;
  const quantityPending = isPending(quantityActionKey);
  const removePending = isPending(removeActionKey);

  function updateQuantity(quantity) {
    void mutate(
      {
        method: "patch",
        url: "/cart/quantity",
        data: { productId: item.productId, quantity },
      },
      "Quantity updated.",
      undefined,
      quantityActionKey,
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        aria-label={`Decrease quantity of ${item.name}`}
        disabled={quantityPending || item.quantity <= 1}
        onClick={() => updateQuantity(item.quantity - 1)}
        className="rounded border px-3 py-1 disabled:opacity-40"
      >
        −
      </button>
      <span aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
      <button
        aria-label={`Increase quantity of ${item.name}`}
        disabled={quantityPending || item.quantity >= 999 || item.available === false}
        onClick={() => updateQuantity(item.quantity + 1)}
        className="rounded border px-3 py-1 disabled:opacity-40"
      >
        +
      </button>
      <button
        disabled={removePending}
        onClick={() =>
          mutate(
            { method: "delete", url: "/cart/remove", data: { productId: item.productId } },
            "Product removed.",
            undefined,
            removeActionKey,
          )
        }
        className="text-error underline disabled:opacity-40"
      >
        {removePending ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}

function WishlistActions({ item, isPending, cart, addToCart, toggleWishlist }) {
  const inCart = cart.some((entry) => entry.productId === item._id);
  const cartPending = isPending("cart:add:" + item._id);
  const wishlistPending = isPending("wishlist:" + item._id);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        disabled={cartPending || !available(item) || inCart}
        onClick={() => addToCart(item)}
        className="text-primary underline disabled:opacity-40"
      >
        {inCart ? "Already in cart" : cartPending ? "Adding..." : "Add to cart"}
      </button>
      <button
        disabled={wishlistPending}
        onClick={() => toggleWishlist(item)}
        className="text-error underline disabled:opacity-40"
      >
        {wishlistPending ? "Removing..." : "Remove"}
      </button>
    </div>
  );
}

function ShoppingPanelItem({ item, isCart, store }) {
  const price = isCart ? item.price : item.currentPrice;

  return (
    <div className="flex items-start gap-4 border-b border-outline-variant pb-4">
      <ProductImage
        src={item.image}
        alt={item.name}
        className="h-20 w-20 shrink-0 rounded-sm bg-surface-container-low object-contain"
      />
      <div className="min-w-0 flex-1 space-y-2">
        <h3 className="font-semibold">{item.name}</h3>
        <p>
          {money(price)}
          {isCart && ` each · ${money(item.price * item.quantity)} total`}
        </p>
        {isCart && item.available === false && (
          <p className="text-sm text-error">
            Requested quantity is unavailable. Reduce it or remove this item.
          </p>
        )}
        {isCart ? (
          <CartQuantityControls
            item={item}
            isPending={store.isPending}
            mutate={store.mutate}
          />
        ) : (
          <WishlistActions
            item={item}
            isPending={store.isPending}
            cart={store.cart}
            addToCart={store.addToCart}
            toggleWishlist={store.toggleWishlist}
          />
        )}
      </div>
    </div>
  );
}

function CartPanelFooter({ cart, isPending, mutate, closePanel }) {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const clearPending = isPending("cart:clear");

  return (
    <div className="space-y-3">
      <p className="flex justify-between font-semibold">
        <span>Subtotal</span>
        <span>{money(subtotal)}</span>
      </p>
      <Link to="/cart" onClick={closePanel} className="block rounded-sm bg-primary px-4 py-2 text-center text-white">
        View full cart
      </Link>
      <p className="text-sm text-outline">Prices and availability are checked again at checkout.</p>
      <button
        disabled={clearPending}
        onClick={() => mutate(
          { method: "delete", url: "/cart/clear" },
          "Cart cleared.",
          undefined,
          "cart:clear",
        )}
        className="text-error underline disabled:opacity-40"
      >
        {clearPending ? "Clearing..." : "Clear cart"}
      </button>
    </div>
  );
}

function WishlistPanelFooter({ isPending, mutate }) {
  const pending = isPending("wishlist:add-all-to-cart");

  return (
    <button
      disabled={pending}
      onClick={() =>
        mutate(
          { method: "post", url: "/wishlist/add-to-cart" },
          "Wishlist added to your cart.",
          "cart",
          "wishlist:add-all-to-cart",
        )
      }
      className="rounded-sm bg-primary px-4 py-2 text-white disabled:opacity-40"
    >
      {pending ? "Adding..." : "Add wishlist to cart"}
    </button>
  );
}

function ShoppingPanel({ panel, items, store, isCart, closePanel }) {
  return (
    <div className="space-y-4">
      {store.loading && items.length === 0 && <Skeleton label={`Loading your ${panel}`} count={2} />}
      {store.errors[panel] && (
        <div role="alert">
          <p className="text-error">{store.errors[panel]}</p>
          <button onClick={store.refreshShopping} disabled={store.loading} className="underline">
            Try again
          </button>
        </div>
      )}
      {!store.loading && !store.errors[panel] && items.length === 0 && (
        <p>Your {panel} is empty. Explore the store to find something you like.</p>
      )}
      {items.map((item) => (
        <ShoppingPanelItem
          key={isCart ? item.productId : item._id}
          item={item}
          isCart={isCart}
          store={store}
        />
      ))}
      {items.length > 0 && !store.errors[panel] &&
        (isCart ? (
          <CartPanelFooter
            cart={store.cart}
            isPending={store.isPending}
            mutate={store.mutate}
            closePanel={closePanel}
          />
        ) : (
          <WishlistPanelFooter
            isPending={store.isPending}
            mutate={store.mutate}
          />
        ))}
    </div>
  );
}

function CustomerPanel() {
  const store = useStore();
  const { panel, setPanel, session, checkSession, cart, wishlist, isPending, logout } = store;
  const isCart = panel === "cart";
  const title = panel === "account" ? "Your account" : isCart ? "Your cart" : "Your wishlist";
  const items = isCart ? cart : wishlist;
  const closePanel = () => setPanel(null);

  return (
    <Modal title={title} onClose={closePanel}>
      {session.status === "checking" ? (
        <Skeleton count={1} label="Checking your session" />
      ) : session.status !== "authenticated" ? (
        <GuestPanel session={session} checkSession={checkSession} closePanel={closePanel} />
      ) : panel === "account" ? (
        <AccountPanel session={session} logoutPending={isPending("account:logout")} logout={logout} />
      ) : (
        <ShoppingPanel panel={panel} items={items} store={store} isCart={isCart} closePanel={closePanel} />
      )}
      {store.notice && (
        <p role="status" className="mt-4 rounded-sm bg-surface-container-low p-3">
          {store.notice}
        </p>
      )}
    </Modal>
  );
}

function ToastNotice({ notice, dismiss }) {
  if (!notice) return null;

  return (
    <div
      role="status"
      className="fixed bottom-5 left-4 right-4 z-40 mx-auto flex max-w-lg items-center justify-between gap-4 rounded-md border border-outline-variant bg-white p-4 "
    >
      <p>{notice}</p>
      <button aria-label="Dismiss message" onClick={dismiss} className="p-2">
        ×
      </button>
    </div>
  );
}

export default function TopNavbar() {
  const {
    categories,
    session,
    cart,
    wishlist,
    errors,
    loading,
    panel,
    setPanel,
    notice,
    setNotice,
    isPending,
    logout,
  } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const header = useRef(null);

  const activeCategory = params.get("category") || "";
  const searchQuery = params.get("q") || "";
  const signedIn = session.status === "authenticated";
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartReady = signedIn && !errors.cart && !loading;
  const wishlistReady = signedIn && !errors.wishlist && !loading;

  useEffect(() => {
    function dismissOpenMenus(event) {
      header.current?.querySelectorAll("details[open]").forEach((menu) => {
        if (event.type === "keydown" && event.key === "Escape") {
          menu.open = false;
          menu.querySelector("summary")?.focus();
          return;
        }
        if (event.type === "pointerdown" && !menu.contains(event.target)) {
          menu.open = false;
        }
      });
    }

    document.addEventListener("pointerdown", dismissOpenMenus);
    document.addEventListener("keydown", dismissOpenMenus);
    return () => {
      document.removeEventListener("pointerdown", dismissOpenMenus);
      document.removeEventListener("keydown", dismissOpenMenus);
    };
  }, []);

  function openWishlist() {
    setPanel("wishlist");
  }

  return (
    <>
      <header
        ref={header}
        className="sticky top-0 z-30 border-b border-outline-variant bg-surface-container-lowest "
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-8 xl:flex-nowrap">
          <BrandLink />
          <CategoryMenu categories={categories} activeCategory={activeCategory} />
          <SearchArea query={searchQuery} onView={(id) => navigate(`/products/${id}`)} />
          <HeaderActions
            session={session}
            logoutPending={isPending("account:logout")}
            cartReady={cartReady}
            cartCount={cartCount}
            wishlistReady={wishlistReady}
            wishlistCount={wishlist.length}
            openWishlist={openWishlist}
            navigate={navigate}
            logout={logout}
          />
        </div>
      </header>

      <ToastNotice notice={!panel ? notice : ""} dismiss={() => setNotice("")} />
      {panel && <CustomerPanel />}
    </>
  );
}
