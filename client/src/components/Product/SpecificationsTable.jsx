export default function SpecificationsTable({ product }) {
  const specs = [
    { label: "Category", value: product?.category || "N/A" },
    { label: "Brand", value: "YourShop Signature" },
    { label: "Model", value: product?._id?.slice(-6).toUpperCase() || "N/A" },
    { label: "Availability", value: product?.stock > 0 ? "In Stock" : "Out of Stock" },
    { label: "Shipping", value: "Free standard shipping" },
    { label: "Warranty", value: "1 Year Limited" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <table className="w-full text-left border-collapse">
        <tbody>
          {specs.map((spec, idx) => (
            <tr 
              key={spec.label}
              className={`border-b border-white/5 last:border-0 ${idx % 2 === 0 ? 'bg-[#1E293B]' : 'bg-[#0A0F1E]'}`}
            >
              <th className="py-4 px-6 text-gray-400 font-medium w-1/3">
                {spec.label}
              </th>
              <td className="py-4 px-6 text-white font-medium">
                {spec.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
