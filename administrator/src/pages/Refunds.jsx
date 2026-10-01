import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi, errorMessage } from "../api";
import { Select } from "../components/FormControls";
import {
  Card,
  Empty,
  PageHeader,
  SkeletonRows,
  StatusBadge,
  inputClass,
  money,
  shortDate,
} from "../components/UI";
import { useAdmin } from "../store/AdminContext";

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const { notify } = useAdmin();
  useEffect(() => {
    let active = true;
    adminApi
      .get("/refunds", { params: { limit: 100 } })
      .then(({ data }) => active && setRefunds(data))
      .catch((error) =>
        notify(errorMessage(error, "Unable to load refunds."), "error"),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [notify]);
  const shown = useMemo(
    () =>
      refunds.filter(
        (refund) =>
          (!status || refund.status === status) &&
          (!query ||
            `${refund._id} ${refund.order} ${refund.reason}`
              .toLowerCase()
              .includes(query.toLowerCase())),
      ),
    [refunds, query, status],
  );
  return (
    <>
      <PageHeader
        eyebrow="After-sales operations"
        title="Refunds"
        description="Review customer requests, photo evidence, payment-provider processing, and final outcomes."
      />
      <Card>
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-muted">
              search
            </span>
            <input
              className={`${inputClass} pl-10`}
              placeholder="Search refund, order, or reason"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <Select
            className={`${inputClass} sm:w-52`}
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All statuses</option>
            {["requested", "processing", "succeeded", "failed", "rejected"].map(
              (value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ),
            )}
          </Select>
        </div>
        {loading ? (
          <SkeletonRows />
        ) : !shown.length ? (
          <Empty icon="currency_exchange" title="No refunds found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-muted">
                <tr>
                  <th className="px-5 py-3">Refund</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Provider</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {shown.map((refund) => (
                  <tr key={refund._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <Link
                        className="font-bold text-primary"
                        to={`/refunds/${refund._id}`}
                      >
                        #{refund._id.slice(-8).toUpperCase()}
                      </Link>
                      <p className="text-xs text-muted">
                        {shortDate(refund.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold hover:text-primary"
                        to={`/orders/${refund.order}`}
                      >
                        #{String(refund.order).slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-5 py-4 capitalize text-muted">
                      {refund.reason.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4 capitalize">{refund.provider}</td>
                    <td className="px-5 py-4">
                      <StatusBadge value={refund.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-bold">
                      {money(refund.amount, refund.currency)}
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
