"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
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

const solvedStatuses = ["Solved", "Closed"];
const urgentStatuses = ["Overdue", "Blocked", "Urgent"];

function fmt(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return isNaN(dt) ? "—" : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function TaskTable({ tickets, onRowClick }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">No tasks found</div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-left">Issue</th>
            <th className="px-4 py-3 text-left">Priority</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Due</th>
            <th className="px-4 py-3 text-left">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr
              key={t["Ticket ID"]}
              onClick={() => onRowClick(t["Ticket ID"])}
              className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-gray-400 font-mono">{t["Ticket ID"]}</td>
              <td className="px-4 py-3 text-gray-700 font-medium max-w-[140px] truncate">{t["Title"]}</td>
              <td className="px-4 py-3 text-gray-500">{t["Customer Name"] || "—"}</td>
              <td className="px-4 py-3 text-gray-500">{t["Issue Type"]}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MyTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    const res = await getTickets();
    if (res.success) setTickets(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Filter only MY tickets
  const myTickets = tickets.filter((t) =>
    t["Assigned To"]?.toLowerCase().includes(user?.fullName?.split(" ")[0]?.toLowerCase())
  );

  const active    = myTickets.filter((t) => !solvedStatuses.includes(t["Status"]));
  const urgent    = myTickets.filter((t) => t["Priority"] === "Urgent" || t["Status"] === "Overdue");
  const completed = myTickets.filter((t) => solvedStatuses.includes(t["Status"]));

  const tabs = [
    { key: "active",    label: "Active",    count: active.length },
    { key: "urgent",    label: "Urgent",    count: urgent.length },
    { key: "completed", label: "Completed", count: completed.length },
  ];

  const current = tab === "active" ? active : tab === "urgent" ? urgent : completed;

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Tasks</h1>
          <p className="text-sm text-gray-400">Tasks assigned to {user?.fullName}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-white shadow-sm text-gray-800 border border-gray-200"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {t.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
              tab === t.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm animate-pulse">
            Loading...
          </div>
        ) : (
          <TaskTable
            tickets={current}
            onRowClick={(id) => router.push(`/dashboard/tasks/${id}`)}
          />
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
