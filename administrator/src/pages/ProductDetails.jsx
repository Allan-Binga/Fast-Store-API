import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import {
  Card,
  Empty,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  money,
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function ProductDetails() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useAdmin();

  useEffect(() => {
    let active = true;
    Promise.all([
      adminApi.get(`/products/admin/${productId}`),
      adminApi.get("/stock/movements", { params: { productId, limit: 100 } }),
    ])
      .then(([productResult, movementResult]) => {
        if (!active) return;
        setProduct(productResult.data);
        setMovements(movementResult.data);
      })
      .catch((error) =>
        notify(errorMessage(error, "Unable to load product."), "error"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [productId, notify]);

  if (loading)
    return (
      <Card>
        <SkeletonRows rows={8} />
      </Card>
    );
  if (!product)
    return (
      <Card>
        <Empty icon="inventory_2" title="Product not found" />
      </Card>
    );

  const stockStatus =
    product.quantity === 0
      ? "out of stock"
      : product.quantity <= (product.reorderPoint ?? 5)
        ? "low stock"
        : "active";

  return (
    <>
      <BackLink to="/products">Products</BackLink>
      <PageHeader
        eyebrow="Catalog record"
        title={product.name}
        description={`Created ${shortDate(product.createdAt)} · Product ${product._id}`}
      >
        <StatusBadge value={stockStatus} />
      </PageHeader>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {product.images?.map((image, index) => (
                <a
                  key={image}
                  href={image}
                  target="_blank"
                  rel="noreferrer"
                  className={index === 0 ? "sm:col-span-2" : ""}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className={`w-full rounded-2xl bg-slate-100 object-cover ${index === 0 ? "h-96" : "h-56"}`}
                  />
                </a>
              ))}
            </div>
          </Card>
          <Card>
            <header className="border-b border-line px-5 py-4">
              <h2 className="font-bold">Inventory history</h2>
            </header>
            {movements.length ? (
              <div className="divide-y divide-line">
                {movements.map((movement) => (
                  <div
                    key={movement._id}
                    className="grid gap-2 p-5 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-bold capitalize">
                        {movement.type.replaceAll("_", " ")}
                      </p>
                      <p className="text-xs text-muted">{movement.reason}</p>
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
                    <span className="text-xs text-muted">
                      {shortDate(movement.occurredAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Empty icon="history" title="No inventory movements" />
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-bold">Product information</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Info label="Selling price" value={money(product.currentPrice)} />
              <Info
                label="Original price"
                value={money(product.originalPrice)}
              />
              <Info label="Discount" value={`${product.discount || 0}%`} />
              <Info label="Categories" value={product.category?.join(", ")} />
              <Info
                label="Rating"
                value={`${product.reviews?.rate || 0} / 5 (${product.reviews?.count || 0} reviews)`}
              />
              <Info
                label="New arrival"
                value={product.newArrival ? "Yes" : "No"}
              />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Stock policy</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Info label="Available units" value={product.quantity} />
              <Info label="Reorder point" value={product.reorderPoint ?? 5} />
              <Info
                label="Reorder quantity"
                value={product.reorderQuantity ?? 10}
              />
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="font-bold">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted">
              {product.description}
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-primary"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      {children}
    </Link>
  );
}
function Info({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-bold">{value ?? "—"}</dd>
    </div>
  );
}
