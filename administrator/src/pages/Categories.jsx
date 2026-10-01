import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { Card, Empty, PageHeader, SkeletonRows } from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useAdmin();

  useEffect(() => {
    let active = true;

    Promise.all([
      adminApi.get("/categories/all"),
      adminApi.get("/products", { params: { limit: 100 } }),
    ])
      .then(([categoryResult, productResult]) => {
        if (!active) return;
        setCategories(categoryResult.data);
        setProducts(productResult.data);
      })
      .catch((error) =>
        notify(errorMessage(error, "Unable to load categories."), "error"),
      )
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [notify]);

  const categorySummaries = useMemo(
    () =>
      categories.map((name) => {
        const categoryProducts = products.filter((product) =>
          product.category?.some(
            (productCategory) =>
              productCategory.toLowerCase() === name.toLowerCase(),
          ),
        );

        return {
          name,
          productCount: categoryProducts.length,
          unitCount: categoryProducts.reduce(
            (total, product) => total + product.quantity,
            0,
          ),
        };
      }),
    [categories, products],
  );

  return (
    <>
      <PageHeader
        eyebrow="Catalog organization"
        title="Categories"
        description="Categories are generated from product category fields and update automatically as products change."
      />

      <Card>
        {loading ? (
          <SkeletonRows />
        ) : !categorySummaries.length ? (
          <Empty icon="category" title="No categories found" />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {categorySummaries.map((category) => (
              <Link
                key={category.name}
                to={`/categories/${encodeURIComponent(category.name)}`}
                className="group rounded-md border border-line p-5 transition hover:border-primary hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <CategoryMark />
                  <div className="min-w-0">
                    <h2 className="truncate font-extrabold group-hover:text-primary">
                      {category.name}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {category.unitCount} units in stock
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-muted">
                  {category.productCount} catalog products
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function CategoryMark() {
  return (
    <span
      className="relative block size-16 shrink-0 overflow-hidden rounded-md bg-blue-50"
      aria-hidden="true"
    >
      <span className="absolute left-3 top-3 size-4 rounded-full bg-primary" />
      <span className="absolute bottom-3 right-3 size-5 rounded-sm bg-sky-400" />
      <span className="absolute bottom-3 left-3 size-0 border-x-[9px] border-b-[16px] border-x-transparent border-b-indigo-700" />
    </span>
  );
}
