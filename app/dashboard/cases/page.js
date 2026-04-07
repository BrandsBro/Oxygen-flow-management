"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTickets } from "@/lib/api";
import NewTaskModal from "@/components/NewTaskModal";

const statusColors = {
  "New":                         "bg-blue-100 text-blue-700",
  "Assigned":                    "bg-purple-100 text-purple-700",
  "In Progress":                 "bg-yellow-100 text-yellow-700",
  "Waiting for Customer":        "bg-orange-100 text-orange-700",
  "Waiting for Carrier":         "bg-orange-100 text-orange-700",
  "Waiting for Internal Review": "bg-orange-100 text-orange-700",
  "Pending":                     "bg-yellow-100 text-yellow-800",
  "Solved":                      "bg-green-100 text-green-700",
  "Closed":                      "bg-gray-100 text-gray-600",
  "Overdue":                     "bg-red-100 text-red-700",
  "Blocked":                     "bg-red-200 text-red-800",
};

function fmt(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function CustomerCasesPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const res = await getTickets();
    if (res.success) setTickets(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Group by customer
  const customerMap = {};
  tickets.forEach((t) => {
    const name = t["Customer Name"] || "Unknown";
    if (!customerMap[name]) customerMap[name] = [];
    customerMap[name].push(t);
  });

  const customers = Object.entries(customerMap)
    .filter(([name]) => !search || name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Cases</h1>
          <p className="text-sm text-gray-400">{customers.length} customers</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Case
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search customers..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
      />

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Order Numbers</th>
              <th className="px-4 py-3 text-left">Total Tickets</th>
              <th className="px-4 py-3 text-left">Open</th>
              <th className="px-4 py-3 text-left">Latest Status</th>
              <th className="px-4 py-3 text-left">Assigned To</th>
              <th className="px-4 py-3 text-left">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-300 animate-pulse">Loading...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No cases found</td></tr>
            ) : customers.map(([name, ctickets]) => {
              const open = ctickets.filter(t => !["Solved","Closed"].includes(t["Status"])).length;
              const latest = ctickets.sort((a,b) => new Date(b["Updated At"]) - new Date(a["Updated At"]))[0];
              const orders = [...new Set(ctickets.map(t => t["Order Number"]).filter(Boolean))].join(", ");
              return (
                <tr
                  key={name}
                  onClick={() => router.push(`/dashboard/tasks/${latest["Ticket ID"]}`)}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
                  <td className="px-4 py-3 text-gray-500">{orders || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{ctickets.length}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${open > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {open}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[latest["Status"]] || ""}`}>
                      {latest["Status"]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{latest["Assigned To"] || "—"}</td>
                  <td className="px-4 py-3 text-gray-400">{fmt(latest["Updated At"])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <NewTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => load()} />
    </div>
  );
}
