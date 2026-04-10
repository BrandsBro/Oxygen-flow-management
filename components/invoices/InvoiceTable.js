import { ExternalLink, Trash2 } from "lucide-react";

export default function InvoiceTable({ invoices, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Invoice Name</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-left">File</th>
              <th className="px-4 py-3 text-left">Added By</th>
              <th className="px-4 py-3 text-left"></th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-400">No invoices found</td></tr>
            ) : invoices.map((inv) => (
              <tr key={inv["Invoice ID"]} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-gray-400 font-mono">{inv["Invoice ID"]}</td>
                <td className="px-4 py-3 font-medium text-gray-700">{inv["Invoice Name"]}</td>
                <td className="px-4 py-3 text-gray-500">{inv["Date"]}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    {inv["Month"]} {inv["Year"]}
                  </span>
                </td>
                <td className="px-4 py-3 text-green-600 font-bold">${Number(inv["Amount"]).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 max-w-[150px] truncate">{inv["Notes"] || "—"}</td>
                <td className="px-4 py-3">
                  {inv["Drive URL"] ? (
                    <a href={inv["Drive URL"]} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs">
                      <ExternalLink size={12} /> View
                    </a>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500">{inv["Added By"]}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onDelete(inv["Invoice ID"])}
                    className="text-red-400 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
