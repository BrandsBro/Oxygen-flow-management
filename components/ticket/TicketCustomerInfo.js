export default function TicketCustomerInfo({ form, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-700">Customer Info</p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Customer Name</label>
          <input
            type="text"
            value={form.customerName}
            onChange={(e) => onChange("customerName", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Order Number</label>
          <input
            type="text"
            value={form.orderNumber}
            onChange={(e) => onChange("orderNumber", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
