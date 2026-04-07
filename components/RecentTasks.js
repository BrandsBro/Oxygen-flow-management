"use client";

const priorityColors = {
  Low:    "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High:   "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

const statusColors = {
  "New":                      "bg-blue-100 text-blue-700",
  "Assigned":                 "bg-purple-100 text-purple-700",
  "In Progress":              "bg-yellow-100 text-yellow-700",
  "Waiting for Customer":     "bg-orange-100 text-orange-700",
  "Waiting for Carrier":      "bg-orange-100 text-orange-700",
  "Waiting for Internal Review": "bg-orange-100 text-orange-700",
  "Pending":                  "bg-yellow-100 text-yellow-800",
  "Solved":                   "bg-green-100 text-green-700",
  "Closed":                   "bg-gray-100 text-gray-600",
  "Overdue":                  "bg-red-100 text-red-700",
  "Blocked":                  "bg-red-200 text-red-800",
};

function fmt(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function RecentTasks({ tickets, onRowClick }) {
  const recent = [...tickets]
    .sort((a, b) => new Date(b["Created At"]) - new Date(a["Created At"]))
    .slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">Recent Tasks</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Issue</th>
              <th className="px-4 py-3 text-left">Assigned</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Due</th>
              <th className="px-4 py-3 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((t) => (
              <tr
                key={t["Ticket ID"]}
                onClick={() => onRowClick?.(t)}
                className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-gray-400 font-mono">{t["Ticket ID"]}</td>
                <td className="px-4 py-3 text-gray-700 font-medium max-w-[140px] truncate">{t["Title"]}</td>
                <td className="px-4 py-3 text-gray-500">{t["Customer Name"] || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{t["Issue Type"]}</td>
                <td className="px-4 py-3 text-gray-500">{t["Assigned To"]}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[t["Priority"]] || ""}`}>
                    {t["Priority"]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t["Status"]] || ""}`}>
                    {t["Status"]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{fmt(t["Due Date"])}</td>
                <td className="px-4 py-3 text-gray-400">{fmt(t["Updated At"])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
