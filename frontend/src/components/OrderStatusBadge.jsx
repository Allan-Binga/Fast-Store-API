import { readableStatus } from "../utils/formatting";

const statusStyles = {
  paid: "bg-emerald-100 text-emerald-800",
  partially_refunded: "bg-blue-100 text-blue-800",
  refunded: "bg-surface-container-high text-on-surface-variant",
  pending: "bg-amber-100 text-amber-800",
  expired: "bg-orange-100 text-orange-800",
  initiated: "bg-blue-100 text-blue-800",
  delivered: "bg-emerald-100 text-emerald-800",
  requested: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  succeeded: "bg-emerald-100 text-emerald-800",
  failed: "bg-error-container text-error",
  rejected: "bg-error-container text-error",
  unfulfilled: "bg-surface-container-high text-on-surface-variant",
};

export default function OrderStatusBadge({ status, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        statusStyles[status] || "bg-surface-container-high text-on-surface-variant"
      }`}
    >
      {label ? `${label}: ` : ""}
      {readableStatus(status)}
    </span>
  );
}
