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
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";
import { BackLink } from "./ProductDetails";

export default function CategoryDetails() {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useAdmin();

  useEffect(() => {
    let active = true;

    adminApi
      .get(`/categories/${encodeURIComponent(category)}`, {
        params: { limit: 100 },
      })
      .then(({ data }) => active && setProducts(data))
      .catch((error) =>
        notify(errorMessage(error, "Unable to load category."), "error"),
      )
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [category, notify]);

  return (
    <>
      <BackLink to="/categories">Categories</BackLink>
      <PageHeader
        eyebrow="Category"
        title={category}
        description={`${products.length} catalog products in this category.`}
      />

      <Card>
        {loading ? (
          <SkeletonRows />
        ) : !products.length ? (
          <Empty icon="category" title="No products in this category" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Categories</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0]}
                          alt=""
                          className="size-12 rounded-xl bg-slate-100 object-cover"
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
                    <td className="px-5 py-4 text-muted">
                      {product.category?.join(", ")}
                    </td>
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
                    <td className="px-5 py-4 text-right">
                      <Link
                        to={`/products/${product._id}`}
                        aria-label={`View ${product.name}`}
                        title={`View ${product.name}`}
                        className="inline-flex rounded-lg p-2 text-muted hover:bg-slate-100 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_forward
                        </span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
