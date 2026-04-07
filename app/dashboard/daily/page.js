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

const columns = [
  {
    key: "today",
    label: "Today",
    color: "border-blue-400",
    filter: (t) => {
      const today = new Date().toDateString();
      return new Date(t["Created At"]).toDateString() === today;
    },
  },
  {
    key: "inprogress",
    label: "In Progress",
    color: "border-yellow-400",
    filter: (t) => t["Status"] === "In Progress",
  },
  {
    key: "pending",
    label: "Pending / Waiting",
    color: "border-orange-400",
    filter: (t) =>
      ["Pending", "Waiting for Customer", "Waiting for Carrier", "Waiting for Internal Review"].includes(t["Status"]),
  },
  {
    key: "blocked",
    label: "Blocked",
    color: "border-red-400",
    filter: (t) => t["Status"] === "Blocked" || t["Status"] === "Overdue",
  },
  {
    key: "done",
    label: "Done",
    color: "border-green-400",
    filter: (t) => t["Status"] === "Solved" || t["Status"] === "Closed",
  },
];

function TicketCard({ ticket, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow space-y-2"
    >
      <p className="text-xs text-gray-400 font-mono">{ticket["Ticket ID"]}</p>
      <p className="text-sm font-semibold text-gray-800 leading-snug">{ticket["Title"]}</p>
      <div className="flex flex-wrap gap-1.5">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[ticket["Priority"]] || ""}`}>
          {ticket["Priority"]}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[ticket["Status"]] || ""}`}>
          {ticket["Status"]}
        </span>
      </div>
      {ticket["Customer Name"] && (
        <p className="text-xs text-gray-400">{ticket["Customer Name"]}</p>
      )}
      {ticket["Assigned To"] && (
        <p className="text-xs text-gray-500 font-medium">{ticket["Assigned To"]}</p>
      )}
    </div>
  );
}

function Column({ col, tickets, onCardClick }) {
  const filtered = tickets.filter(col.filter);
  return (
    <div className="flex flex-col min-w-[220px] flex-1">
      {/* Column Header */}
      <div className={`border-t-4 ${col.color} bg-white rounded-xl shadow-sm px-4 py-3 mb-3 flex items-center justify-between`}>
        <p className="text-sm font-semibold text-gray-700">{col.label}</p>
        <span className="bg-gray-100 text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full">
          {filtered.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-300 text-xs py-6">No tasks</div>
        ) : (
          filtered.map((t) => (
            <TicketCard
              key={t["Ticket ID"]}
              ticket={t}
              onClick={() => onCardClick(t["Ticket ID"])}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function DailyBoardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterMember, setFilterMember] = useState("");

  async function load() {
    const res = await getTickets();
    if (res.success) setTickets(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = filterMember
    ? tickets.filter((t) => t["Assigned To"]?.includes(filterMember))
    : tickets;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daily Board</h1>
          <p className="text-sm text-gray-400">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Member Filter */}
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="">All Members</option>
            {["Sium", "Mehedi", "Nazmul"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + New Task
          </button>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex gap-4 animate-pulse flex-1">
          {columns.map((c) => (
            <div key={c.key} className="flex-1 bg-gray-100 rounded-xl min-h-[400px]" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto flex-1 pb-4">
          {columns.map((col) => (
            <Column
              key={col.key}
              col={col}
              tickets={filtered}
              onCardClick={(id) => router.push(`/dashboard/tasks/${id}`)}
            />
          ))}
        </div>
      )}

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
