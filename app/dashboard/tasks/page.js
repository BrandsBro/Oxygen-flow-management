"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTickets } from "@/lib/api";
import NewTaskModal from "@/components/NewTaskModal";

const priorityColors = {
  Low:    "bg-gray-100 text-gray-600",
  Medium: "bg-blue-100 text-blue-700",
  High:   "bg-orange-100 text-orange-700",
  Urgent: "bg-red-100 text-red-700",
};

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

export default function AllTasksPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const res = await getTickets();
    if (res.success) setTickets(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = tickets.filter((t) => {
    const matchSearch =
      !search ||
      t["Title"]?.toLowerCase().includes(search.toLowerCase()) ||
      t["Customer Name"]?.toLowerCase().includes(search.toLowerCase()) ||
      t["Ticket ID"]?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t["Status"] === filterStatus;
    const matchPriority = !filterPriority || t["Priority"] === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Tasks</h1>
          <p className="text-sm text-gray-400">{filtered.length} tickets found</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search by title, customer, ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
        >
          <option value="">All Statuses</option>
          {["New","Assigned","In Progress","Waiting for Customer","Waiting for Carrier",
            "Waiting for Internal Review","Pending","Solved","Closed","Overdue","Blocked"
          ].map((s) => <option key={s}>{s}</option>)}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
        >
          <option value="">All Priorities</option>
          {["Low","Medium","High","Urgent"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm animate-pulse">
            Loading tickets...
          </div>
        ) : (
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">No tickets found</td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr
                      key={t["Ticket ID"]}
                      onClick={() => router.push(`/dashboard/tasks/${t["Ticket ID"]}`)}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400 font-mono">{t["Ticket ID"]}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium max-w-[140px] truncate">{t["Title"]}</td>
                      <td className="px-4 py-3 text-gray-500">{t["Customer Name"] || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{t["Issue Type"]}</td>
                      <td className="px-4 py-3 text-gray-500">{t["Assigned To"]}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${priorityColors[t["Priority"]] || ""}`}>
                          {t["Priority"]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-medium ${statusColors[t["Status"]] || ""}`}>
                          {t["Status"]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{fmt(t["Due Date"])}</td>
                      <td className="px-4 py-3 text-gray-400">{fmt(t["Updated At"])}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
