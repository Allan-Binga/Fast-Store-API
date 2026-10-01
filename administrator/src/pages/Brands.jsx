import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import Modal from "../components/Modal";
import {
  Button,
  Card,
  Empty,
  Field,
  PageHeader,
  SkeletonRows,
  inputClass,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { notify } = useAdmin();
  const load = async () => {
    try {
      const { data } = await adminApi.get("/brands", {
        params: { limit: 100 },
      });
      setBrands(data);
    } catch (error) {
      notify(errorMessage(error, "Unable to load brands."), "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <>
      <PageHeader
        eyebrow="Catalog organization"
        title="Brands"
        description="Manage supplier identity, logo assets, and the products grouped under each brand."
      >
        <Button onClick={() => setCreating(true)}>
          <span className="material-symbols-outlined text-[19px]">add</span>Add
          brand
        </Button>
      </PageHeader>
      <Card>
        {loading ? (
          <SkeletonRows />
        ) : !brands.length ? (
          <Empty icon="branding_watermark" title="No brands yet" />
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {brands.map((brand) => (
              <Link
                key={brand._id}
                to={`/brands/${brand._id}`}
                className="group rounded-2xl border border-line p-5 transition hover:border-primary hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo`}
                    className="size-16 rounded-2xl bg-slate-100 object-contain p-2"
                  />
                  <div className="min-w-0">
                    <h2 className="font-extrabold group-hover:text-primary">
                      {brand.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">
                      {brand.slogan}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-muted">
                  {brand.products?.length || 0} assigned products
                </p>
              </Link>
            ))}
          </div>
        )}
      </Card>
      {creating && (
        <BrandForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
            notify("Brand created.");
          }}
        />
      )}
    </>
  );
}
function BrandForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", slogan: "" });
  const [logo, setLogo] = useState(null);
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("slogan", form.slogan);
      body.append("logo", logo);
      await adminApi.post("/brands/add", body);
      onSaved();
    } catch (error) {
      alert(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal title="Add brand" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Brand name">
          <input
            className={inputClass}
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <Field label="Slogan">
          <input
            className={inputClass}
            maxLength="100"
            required
            value={form.slogan}
            onChange={(event) =>
              setForm({ ...form, slogan: event.target.value })
            }
          />
        </Field>
        <Field label="Logo image" hint="JPEG, PNG, or WebP up to 5 MB.">
          <input
            className={`${inputClass} py-2`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            onChange={(event) => setLogo(event.target.files[0])}
          />
        </Field>
        <Button className="w-full" disabled={busy}>
          {busy ? "Uploading…" : "Create brand"}
        </Button>
      </form>
    </Modal>
  );
}
