import { useCallback, useEffect, useRef, useState } from "react";
import { api, customerRequest, errorMessage } from "../api";
import useResource from "../hooks/useResource";
import { StoreContext } from "./context";

export default function StoreProvider({ children }) {
  const categories = useResource("/categories/all");
  const [session, setSession] = useState({ status: "checking", user: null });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState([]);
  const pendingActionsRef = useRef(new Set());
  const shoppingLoaded = useRef(false);
  const shoppingRequestVersion = useRef(0);
  const sessionVersion = useRef(0);
  const [notice, setNotice] = useState("");
  const [panel, setPanel] = useState(null);

  const refreshShopping = useCallback(async () => {
    const version = sessionVersion.current;
    const requestVersion = ++shoppingRequestVersion.current;
    const isInitialLoad = !shoppingLoaded.current;

    if (isInitialLoad) setLoading(true);

    const results = await Promise.allSettled([
      customerRequest({ url: "/cart/user" }),
      customerRequest({ url: "/wishlist/user" }),
    ]);

    if (
      version !== sessionVersion.current ||
      requestVersion !== shoppingRequestVersion.current
    ) {
      return;
    }

    const nextErrors = {};
    results.forEach((result, index) => {
      const key = index === 0 ? "cart" : "wishlist";
      const setter = index === 0 ? setCart : setWishlist;
      if (result.status === "fulfilled")
        setter(result.value.data.products || []);
      else {
        setter([]);
        nextErrors[key] = errorMessage(result.reason);
      }
    });
    setErrors(nextErrors);
    if (
      results.some(
        (result) =>
          result.status === "rejected" &&
          [401, 403].includes(result.reason.response?.status),
      )
    ) {
      setSession({ status: "guest", user: null });
      setCart([]);
      setWishlist([]);
    }
    shoppingLoaded.current = true;
    if (isInitialLoad) setLoading(false);
  }, []);

  const isPending = useCallback(
    (actionKey) => pendingActions.includes(actionKey),
    [pendingActions],
  );

  function beginAction(actionKey) {
    if (pendingActionsRef.current.has(actionKey)) return false;

    pendingActionsRef.current.add(actionKey);
    setPendingActions(Array.from(pendingActionsRef.current));
    return true;
  }

  function endAction(actionKey) {
    pendingActionsRef.current.delete(actionKey);
    setPendingActions(Array.from(pendingActionsRef.current));
  }

  const checkSession = useCallback(async () => {
    const version = sessionVersion.current;
    try {
      const { data } = await customerRequest({ url: "/auth/check-session" });
      if (version !== sessionVersion.current) return;
      setSession({ status: "authenticated", user: data.user });
      await refreshShopping();
    } catch (error) {
      if (version !== sessionVersion.current) return;
      setCart([]);
      setWishlist([]);
      setSession({
        status: [401, 403].includes(error.response?.status) ? "guest" : "error",
        user: null,
      });
    }
  }, [refreshShopping]);

  useEffect(() => {
    let active = true;
    const version = sessionVersion.current;
    customerRequest({ url: "/auth/check-session" })
      .then(({ data }) => {
        if (!active || version !== sessionVersion.current) return;
        setSession({ status: "authenticated", user: data.user });
        void refreshShopping();
      })
      .catch((error) => {
        if (active && version === sessionVersion.current)
          setSession({
            status: [401, 403].includes(error.response?.status)
              ? "guest"
              : "error",
            user: null,
          });
      });
    return () => {
      active = false;
    };
  }, [refreshShopping]);

  useEffect(() => {
    if (!notice) return undefined;

    const timeout = window.setTimeout(() => setNotice(""), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  async function mutate(config, message, after, actionKey = "shopping:update") {
    if (session.status !== "authenticated") {
      setPanel("account");
      return;
    }

    if (!beginAction(actionKey)) return;

    const version = sessionVersion.current;
    setNotice("");

    try {
      await customerRequest(config);
      if (version !== sessionVersion.current) return;

      await refreshShopping();
      if (version !== sessionVersion.current) return;

      setNotice(message);
      if (after) setPanel(after);
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        setSession({ status: "guest", user: null });
        setCart([]);
        setWishlist([]);
        setPanel("account");
      }
      setNotice(errorMessage(error));
    } finally {
      endAction(actionKey);
    }
  }

  const addToCart = (product, quantity = 1) =>
    mutate(
      product.endTime
        ? {
            method: "post",
            url: "/flashsale/add-to-cart",
            data: { productId: product._id, quantity },
          }
        : {
            method: "post",
            url: "/cart/add",
            data: { products: [{ productId: product._id, quantity }] },
          },
      "Added to your cart.",
      undefined,
      "cart:add:" + product._id,
    );
  const toggleWishlist = (product) => {
    const saved = wishlist.some((item) => item._id === product._id);
    return mutate(
      {
        method: saved ? "delete" : "post",
        url: saved ? "/wishlist" : "/wishlist/add-to-wishlist",
        data: { productId: product._id },
      },
      saved ? "Removed from your wishlist." : "Saved to your wishlist.",
      undefined,
      "wishlist:" + product._id,
    );
  };
  const invalidateSession = useCallback(() => {
    sessionVersion.current += 1;
    setSession({ status: "guest", user: null });
    setCart([]);
    setWishlist([]);
    setErrors({});
    shoppingLoaded.current = false;
    shoppingRequestVersion.current += 1;
    setLoading(false);
    pendingActionsRef.current.clear();
    setPendingActions([]);
    setPanel(null);
    setNotice("");
  }, []);

  async function login(credentials) {
    // Login must send/accept HttpOnly cookies without treating bad credentials as token expiry.
    const { data } = await api.post("/auth/login", credentials, {
      withCredentials: true,
    });
    setSession({ status: "authenticated", user: data.user });
    setPanel(null);
    setNotice("");
    setCart([]);
    setWishlist([]);
    shoppingLoaded.current = false;
    void refreshShopping();
  }

  async function logout() {
    const actionKey = "account:logout";
    if (!beginAction(actionKey)) return;

    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      invalidateSession();
      setNotice("You have signed out.");
    } catch (error) {
      setNotice(errorMessage(error));
    } finally {
      endAction(actionKey);
    }
  }

  return (
    <StoreContext.Provider
      value={{
        categories,
        session,
        cart,
        wishlist,
        errors,
        loading,
        isPending,
        notice,
        setNotice,
        panel,
        setPanel,
        checkSession,
        refreshShopping,
        addToCart,
        toggleWishlist,
        mutate,
        login,
        logout,
        invalidateSession,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
