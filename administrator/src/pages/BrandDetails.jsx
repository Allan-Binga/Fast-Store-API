import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
  inputClass,
  money,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";
import { BackLink } from "./ProductDetails";

export default function BrandDetails() {
  const { brandId } = useParams();
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const [brandResult, productsResult] = await Promise.all([
        adminApi.get(`/brands/${brandId}`),
        adminApi.get("/products", { params: { limit: 100 } }),
      ]);
      setBrand(brandResult.data);
      setProducts(productsResult.data);
    } catch (error) {
      notify(errorMessage(error, "Unable to load brand."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading)
    return (
      <Card>
        <SkeletonRows />
      </Card>
    );
  if (!brand)
    return (
      <Card>
        <Empty title="Brand not found" />
      </Card>
    );
  return (
    <>
      <BackLink to="/brands">Brands</BackLink>
      <PageHeader
        eyebrow="Brand record"
        title={brand.name}
        description={brand.slogan}
      >
        <Button onClick={() => setAssigning(true)}>
          <span className="material-symbols-outlined text-[19px]">
            add_link
          </span>
          Assign product
        </Button>
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="p-6 text-center">
          <img
            src={brand.logo}
            alt={`${brand.name} logo`}
            className="mx-auto size-40 rounded-3xl bg-slate-50 object-contain p-4"
          />
          <p className="mt-4 text-sm text-muted">
            {brand.products?.length || 0} products assigned
          </p>
        </Card>
        <Card>
          <header className="border-b border-line px-5 py-4">
            <h2 className="font-bold">Brand products</h2>
          </header>
          {!brand.products?.length ? (
            <Empty icon="inventory_2" title="No products assigned" />
          ) : (
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {brand.products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="flex gap-3 rounded-xl border border-line p-3 hover:border-primary"
                >
                  <img
                    src={product.images?.[0]}
                    alt=""
                    className="size-16 rounded-xl bg-slate-100 object-cover"
                  />
                  <div>
                    <p className="font-bold">{product.name}</p>
                    <p className="text-sm text-muted">
                      {money(product.currentPrice)} · {product.quantity} units
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
      {assigning && (
        <AssignProduct
          brand={brand}
          products={products}
          onClose={() => setAssigning(false)}
          onSaved={() => {
            setAssigning(false);
            load();
            notify("Product assigned to brand.");
          }}
        />
      )}
    </>
  );
}
function AssignProduct({ brand, products, onClose, onSaved }) {
  const assigned = new Set(
    (brand.products || []).map((product) => String(product._id || product)),
  );
  const available = products.filter(
    (product) => !assigned.has(String(product._id)),
  );
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await adminApi.post("/brands/add-product-to-brand", {
        brandId: brand._id,
        productId,
      });
      onSaved();
    } catch (error) {
      alert(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Assign product" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Product">
          <Select
            className={inputClass}
            required
            value={productId}
            onChange={(event) => setProductId(event.target.value)}
          >
            <option value="">Choose a product</option>
            {available.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </Select>
        </Field>
        {!available.length && (
          <p className="text-sm text-muted">
            Every catalog product is already assigned to this brand.
          </p>
        )}
        <Button className="w-full" disabled={busy || !available.length}>
          {busy ? "Assigning…" : "Assign product"}
        </Button>
      </form>
    </Modal>
  );
}
