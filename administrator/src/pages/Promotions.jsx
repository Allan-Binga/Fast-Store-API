import { useEffect, useMemo, useState } from "react";
import { adminApi, errorMessage } from "../api";
import { CalendarInput, Select } from "../components/FormControls";
import Modal from "../components/Modal";
import {
  Button,
  Card,
  Empty,
  Field,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  inputClass,
  money,
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Promotions() {
  const [tab, setTab] = useState("deal");
  const [promos, setPromos] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [create, setCreate] = useState(false);
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const [p, s, c] = await Promise.all([
        adminApi.get("/promo", { params: { limit: 100 } }),
        adminApi.get("/flashsale", { params: { limit: 100 } }),
        adminApi.get("/products", { params: { limit: 100 } }),
      ]);
      setPromos(p.data);
      setSales(s.data);
      setProducts(c.data);
    } catch (e) {
      notify(errorMessage(e, "Unable to load promotions."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const displayed = useMemo(
    () =>
      tab === "flash" ? sales : promos.filter((item) => item.type === tab),
    [tab, sales, promos],
  );
  return (
    <>
      <PageHeader
        eyebrow="Merchandising"
        title="Promotions"
        description="Feature products in deals and schedule limited-stock flash sales using the live catalog."
      >
        <Button onClick={() => setCreate(true)}>
          <span className="material-symbols-outlined text-[19px]">add</span>
          {tab === "flash" ? "Create flash sale" : "Add promotion"}
        </Button>
      </PageHeader>
      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-line p-2">
          {[
            ["deal", "Deals"],
            ["mega-deal", "Mega Deals"],
            ["flash", "Active Flash Sales"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-bold ${tab === key ? "bg-primary text-white" : "text-muted hover:bg-slate-100"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {loading ? (
          <SkeletonRows />
        ) : !displayed.length ? (
          <Empty
            icon="campaign"
            title="No active campaigns"
            text={
              tab === "flash"
                ? "Only flash sales within their active time window are returned by the API."
                : "Add a catalog product to this promotion group."
            }
          />
        ) : (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {displayed.map((item) => {
              const product = item.product || item;
              return (
                <article
                  key={item._id + tab}
                  className="overflow-hidden rounded-2xl border border-line"
                >
                  <div className="relative h-44 bg-slate-100">
                    <img
                      src={product.images?.[0] || product.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute left-3 top-3">
                      <StatusBadge
                        value={tab === "flash" ? "active" : item.type}
                      />
                    </span>
                  </div>
                  <div className="p-4">
                    <h2 className="font-bold">{product.name}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {product.category}
                    </p>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-lg font-extrabold">
                          {money(product.currentPrice)}
                        </p>
                        {product.originalPrice && (
                          <p className="text-xs text-muted line-through">
                            {money(product.originalPrice)}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-muted">
                        {tab === "flash" ? (
                          <>
                            <p>{item.quantityAvailable} units remaining</p>
                            <p>Ends {shortDate(item.endTime)}</p>
                          </>
                        ) : (
                          <p>Priority {item.priority}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>
      {create &&
        (tab === "flash" ? (
          <FlashForm
            products={products}
            onClose={() => setCreate(false)}
            onSaved={() => {
              setCreate(false);
              load();
              notify("Flash sale created.");
            }}
          />
        ) : (
          <PromoForm
            type={tab}
            products={products}
            onClose={() => setCreate(false)}
            onSaved={() => {
              setCreate(false);
              load();
              notify("Promotion added.");
            }}
          />
        ))}
    </>
  );
}
function PromoForm({ type, products, onClose, onSaved }) {
  const [form, setForm] = useState({ productId: "", priority: 0 });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post("/promo/add", {
        ...form,
        type,
        priority: Number(form.priority),
      });
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={`Add ${type.replace("-", " ")}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Product">
          <Select
            required
            className={inputClass}
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Choose a product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Display priority" hint="Lower numbers appear first.">
          <input
            className={inputClass}
            type="number"
            step="1"
            required
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />
        </Field>
        <Button className="w-full" disabled={busy}>
          {busy ? "Adding…" : "Add to promotion"}
        </Button>
      </form>
    </Modal>
  );
}
function FlashForm({ products, onClose, onSaved }) {
  const [form, setForm] = useState({
    productId: "",
    currentPrice: "",
    quantityAvailable: "",
    startTime: "",
    endTime: "",
  });
  const [busy, setBusy] = useState(false);
  const selected = products.find((p) => p._id === form.productId);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post("/flashsale/add", {
        ...form,
        currentPrice: Number(form.currentPrice),
        quantityAvailable: Number(form.quantityAvailable),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      });
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Create flash sale" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Product">
          <Select
            required
            className={inputClass}
            value={form.productId}
            onChange={(e) => setForm({ ...form, productId: e.target.value })}
          >
            <option value="">Choose a product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — {money(p.currentPrice)}
              </option>
            ))}
          </Select>
        </Field>
        {selected && (
          <p className="rounded-xl bg-blue-50 p-3 text-xs text-blue-800">
            Regular price {money(selected.currentPrice)} · {selected.quantity}{" "}
            units in stock
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Sale price">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="0.01"
              required
              value={form.currentPrice}
              onChange={(e) =>
                setForm({ ...form, currentPrice: e.target.value })
              }
            />
          </Field>
          <Field label="Sale quantity">
            <input
              className={inputClass}
              type="number"
              min="1"
              max={selected?.quantity}
              required
              value={form.quantityAvailable}
              onChange={(e) =>
                setForm({ ...form, quantityAvailable: e.target.value })
              }
            />
          </Field>
        </div>
        <Field label="Starts">
          <CalendarInput
            className={inputClass}
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
          />
        </Field>
        <Field label="Ends">
          <CalendarInput
            className={inputClass}
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
          />
        </Field>
        <Button className="w-full" disabled={busy}>
          {busy ? "Creating…" : "Create flash sale"}
        </Button>
      </form>
    </Modal>
  );
}
