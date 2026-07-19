const STATUS_CONFIG = {
  processing: { label: "Processing", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  shipped: { label: "Shipped", className: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  delivered: { label: "Delivered", className: "bg-green-500/15 text-green-400 border-green-500/30" },
  cancelled: { label: "Cancelled", className: "bg-red-500/15 text-red-400 border-red-500/30" },
  pending: { label: "Pending", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toLowerCase()] || {
    label: status || "Unknown",
    className: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {config.label}
    </span>
  );
}
