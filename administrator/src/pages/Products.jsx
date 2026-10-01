import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { Select } from "../components/FormControls";
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

const blankProduct = {
  name: "",
  currentPrice: "",
  originalPrice: "",
  costPrice: "",
  quantity: "",
  reorderPoint: "5",
  reorderQuantity: "10",
  category: "",
  description: "",
  newArrival: false,
  reviewsCount: "0",
  reviewsRate: "0",
};
export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState(null);
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const { data } = await adminApi.get("/products", {
        params: { limit: 100 },
      });
      setProducts(data);
    } catch (e) {
      notify(errorMessage(e, "Unable to load products."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const categories = [
    ...new Set(products.flatMap((product) => product.category || [])),
  ];
  const shown = useMemo(
    () =>
      products.filter(
        (p) =>
          (!query ||
            `${p.name} ${p.category}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (!category || p.category?.includes(category)),
      ),
    [products, query, category],
  );
  async function remove(product) {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`))
      return;
    try {
      await adminApi.delete(`/products/${product._id}`);
      setProducts((list) => list.filter((item) => item._id !== product._id));
      notify("Product deleted.");
    } catch (e) {
      notify(errorMessage(e), "error");
    }
  }
  return (
    <>
      <PageHeader
        eyebrow="Catalog & inventory"
        title="Products Management"
        description="Create products, upload storefront images, and monitor inventory levels."
      >
        <Button
          variant="secondary"
          onClick={() => setModal({ type: "movements" })}
        >
          <span className="material-symbols-outlined text-[19px]">history</span>
          Stock history
        </Button>
        <Button onClick={() => setModal({ type: "product" })}>
          <span className="material-symbols-outlined text-[19px]">add</span>Add
          product
        </Button>
      </PageHeader>
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted">
              search
            </span>
            <input
              className={`${inputClass} pl-10`}
              placeholder="Search products or categories"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select
            className={`${inputClass} sm:w-52`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </Select>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : !shown.length ? (
          <Empty
            icon="inventory_2"
            title="No matching products"
            text="Add a product or change the filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          className="size-12 rounded-xl bg-slate-100 object-cover"
                          src={product.images?.[0]}
                          alt=""
                        />
                        <div>
                          <Link
                            to={`/products/${product._id}`}
                            className="max-w-xs font-bold hover:text-primary"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted">
                            {product.newArrival
                              ? "New arrival"
                              : "Standard listing"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{product.category}</td>
                    <td className="px-5 py-4 font-semibold">
                      {money(product.currentPrice)}
                    </td>
                    <td className="px-5 py-4">
                      <strong>{product.quantity}</strong>
                      <span className="text-muted">
                        {" "}
                        / reorder {product.reorderPoint ?? 5}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        value={
                          product.quantity === 0
                            ? "out of stock"
                            : product.quantity <= (product.reorderPoint ?? 5)
                              ? "low stock"
                              : "active"
                        }
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Icon
                          icon="add_chart"
                          label="Adjust stock"
                          onClick={() => setModal({ type: "stock", product })}
                        />
                        <Icon
                          icon="edit"
                          label="Edit product"
                          onClick={() => setModal({ type: "product", product })}
                        />
                        <Icon
                          icon="delete"
                          label="Delete product"
                          onClick={() => remove(product)}
                          danger
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      {modal?.type === "movements" && (
        <MovementHistory onClose={() => setModal(null)} />
      )}
      {modal?.type === "product" && (
        <ProductForm
          product={modal.product}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
            notify(`Product ${modal.product ? "updated" : "created"}.`);
          }}
        />
      )}
      {modal?.type === "stock" && (
        <StockForm
          product={modal.product}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            load();
            notify("Inventory adjusted.");
          }}
        />
      )}
    </>
  );
}
function Icon({ icon, label, onClick, danger }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg p-2 hover:bg-slate-100 ${danger ? "text-red-600" : "text-muted"}`}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </button>
  );
}
function ProductForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState(
    product
      ? {
          ...blankProduct,
          ...product,
          category: Array.isArray(product.category)
            ? product.category.join(", ")
            : product.category,
          reviewsCount: product.reviews?.count ?? 0,
          reviewsRate: product.reviews?.rate ?? 0,
          costPrice: "",
        }
      : blankProduct,
  );
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const change = (n) => (e) =>
    setForm({
      ...form,
      [n]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    });
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = new FormData();
      const fields = [
        "name",
        "currentPrice",
        "originalPrice",
        "costPrice",
        "quantity",
        "reorderPoint",
        "reorderQuantity",
        "category",
        "description",
        "newArrival",
      ];
      fields.forEach((k) => {
        if (form[k] !== "" && form[k] != null)
          body.append(
            k,
            k === "category"
              ? JSON.stringify(
                  String(form[k])
                    .split(",")
                    .map((value) => value.trim())
                    .filter(Boolean),
                )
              : form[k],
          );
      });
      body.append("reviews.count", form.reviewsCount || 0);
      body.append("reviews.rate", form.reviewsRate || 0);
      files.forEach((file) => body.append("images", file));
      if (product) await adminApi.put(`/products/update/${product._id}`, body);
      else await adminApi.post("/products/add-new", body);
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={product ? "Edit product" : "Add product"}
      wide
      onClose={onClose}
    >
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Product name">
            <input
              className={inputClass}
              required
              value={form.name}
              onChange={change("name")}
            />
          </Field>
        </div>
        {[
          ["Current price", "currentPrice"],
          ["Original price", "originalPrice"],
          [product ? "New cost price (optional)" : "Cost price", "costPrice"],
          ["Quantity", "quantity"],
          ["Reorder point", "reorderPoint"],
          ["Reorder quantity", "reorderQuantity"],
        ].map(([label, key]) => (
          <Field key={key} label={label}>
            <input
              className={inputClass}
              type="number"
              min="0"
              step={key.toLowerCase().includes("price") ? "0.01" : "1"}
              required={!product || key !== "costPrice"}
              value={form[key]}
              onChange={change(key)}
            />
          </Field>
        ))}
        <Field label="Category">
          <input
            className={inputClass}
            required
            value={form.category}
            onChange={change("category")}
          />
        </Field>
        <Field
          label="Images"
          hint={
            product
              ? "Leave empty to keep existing images."
              : "Choose 1–4 images."
          }
        >
          <input
            className={`${inputClass} py-2`}
            type="file"
            accept="image/*"
            multiple
            required={!product}
            onChange={(e) => setFiles([...e.target.files].slice(0, 4))}
          />
        </Field>
        <Field label="Review count">
          <input
            className={inputClass}
            type="number"
            min="0"
            value={form.reviewsCount}
            onChange={change("reviewsCount")}
          />
        </Field>
        <Field label="Review rating">
          <input
            className={inputClass}
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.reviewsRate}
            onChange={change("reviewsRate")}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              className={`${inputClass} py-3`}
              rows="4"
              required
              value={form.description}
              onChange={change("description")}
            />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={Boolean(form.newArrival)}
            onChange={change("newArrival")}
          />
          Mark as new arrival
        </label>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy}>{busy ? "Saving…" : "Save product"}</Button>
        </div>
      </form>
    </Modal>
  );
}
function StockForm({ product, onClose, onSaved }) {
  const [form, setForm] = useState({ quantityChange: "", reason: "restock" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await adminApi.post(`/stock/${product._id}/adjust`, {
        quantityChange: Number(form.quantityChange),
        reason: form.reason,
      });
      onSaved();
    } catch (e) {
      alert(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title={`Adjust ${product.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-slate-50 p-3 text-sm">
          Current stock: <strong>{product.quantity}</strong>. Use a negative
          number to remove units.
        </p>
        <Field label="Quantity change">
          <input
            className={inputClass}
            type="number"
            required
            value={form.quantityChange}
            onChange={(e) =>
              setForm({ ...form, quantityChange: e.target.value })
            }
          />
        </Field>
        <Field label="Reason">
          <Select
            className={inputClass}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          >
            <option value="restock">Restock</option>
            <option value="correction">Correction</option>
            <option value="damage">Damage</option>
            <option value="return">Customer return</option>
          </Select>
        </Field>
        <Button className="w-full" disabled={busy}>
          {busy ? "Updating…" : "Update inventory"}
        </Button>
      </form>
    </Modal>
  );
}
function MovementHistory({ onClose }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    adminApi
      .get("/stock/movements", { params: { limit: 100 } })
      .then(({ data }) => active && setMovements(data))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <Modal title="Inventory movement history" wide onClose={onClose}>
      {loading ? (
        <SkeletonRows />
      ) : !movements.length ? (
        <Empty icon="history" title="No stock movements yet" />
      ) : (
        <div className="max-h-[60vh] divide-y divide-line overflow-y-auto">
          {movements.map((movement) => (
            <div
              key={movement._id}
              className="grid gap-2 py-4 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
            >
              <div>
                <p className="font-bold capitalize">
                  {movement.type.replaceAll("_", " ")}
                </p>
                <p className="text-xs text-muted">
                  Product {String(movement.product).slice(-8).toUpperCase()} ·{" "}
                  {movement.reason}
                </p>
              </div>
              <strong
                className={
                  movement.quantityChange > 0
                    ? "text-emerald-700"
                    : "text-red-700"
                }
              >
                {movement.quantityChange > 0 ? "+" : ""}
                {movement.quantityChange}
              </strong>
              <p className="text-xs text-muted">
                {shortDate(movement.occurredAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
