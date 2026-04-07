"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTickets, updateTicket } from "@/lib/api";
import NewTaskModal from "@/components/NewTaskModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAuth } from "@/context/AuthContext";

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
    headerBg: "bg-blue-50",
    status: "New",
    filter: (t) => {
      const today = new Date().toDateString();
      return new Date(t["Created At"]).toDateString() === today;
    },
  },
  {
    key: "inprogress",
    label: "In Progress",
    color: "border-yellow-400",
    headerBg: "bg-yellow-50",
    status: "In Progress",
    filter: (t) => t["Status"] === "In Progress",
  },
  {
    key: "pending",
    label: "Pending / Waiting",
    color: "border-orange-400",
    headerBg: "bg-orange-50",
    status: "Pending",
    filter: (t) =>
      ["Pending", "Waiting for Customer", "Waiting for Carrier", "Waiting for Internal Review"].includes(t["Status"]),
  },
  {
    key: "blocked",
    label: "Blocked",
    color: "border-red-400",
    headerBg: "bg-red-50",
    status: "Blocked",
    filter: (t) => t["Status"] === "Blocked" || t["Status"] === "Overdue",
  },
  {
    key: "done",
    label: "Done",
    color: "border-green-400",
    headerBg: "bg-green-50",
    status: "Solved",
    filter: (t) => t["Status"] === "Solved" || t["Status"] === "Closed",
  },
];

function TicketCard({ ticket, index, onClick }) {
  return (
    <Draggable draggableId={ticket["Ticket ID"]} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-xl border border-gray-100 p-4 cursor-grab active:cursor-grabbing space-y-2 transition-shadow ${
            snapshot.isDragging ? "shadow-xl ring-2 ring-blue-400 rotate-1" : "shadow-sm hover:shadow-md"
          }`}
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
      )}
    </Draggable>
  );
}

function Column({ col, tickets, onCardClick }) {
  const filtered = tickets.filter(col.filter);
  return (
    <div className="flex flex-col min-w-[220px] flex-1">
      <div className={`border-t-4 ${col.color} ${col.headerBg} rounded-xl px-4 py-3 mb-3 flex items-center justify-between`}>
        <p className="text-sm font-semibold text-gray-700">{col.label}</p>
        <span className="bg-white text-gray-500 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
          {filtered.length}
        </span>
      </div>

      <Droppable droppableId={col.key}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-3 flex-1 min-h-[200px] rounded-xl p-2 transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50/50 border-2 border-dashed border-blue-300" : ""
            }`}
          >
            {filtered.length === 0 && !snapshot.isDraggingOver ? (
              <div className="text-center text-gray-300 text-xs py-6">No tasks</div>
            ) : (
              filtered.map((t, index) => (
                <TicketCard
                  key={t["Ticket ID"]}
                  ticket={t}
                  index={index}
                  onClick={() => onCardClick(t["Ticket ID"])}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default function DailyBoardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterMember, setFilterMember] = useState("");
  const [updating, setUpdating] = useState(false);

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

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    // Find the new status based on destination column
    const destCol = columns.find(c => c.key === destination.droppableId);
    if (!destCol) return;

    const newStatus = destCol.status;

    // Optimistically update UI
    setTickets(prev =>
      prev.map(t =>
        t["Ticket ID"] === draggableId
          ? { ...t, "Status": newStatus }
          : t
      )
    );

    // Update in Google Sheet
    setUpdating(true);
    try {
      await updateTicket({
        id: draggableId,
        status: newStatus,
        updatedBy: user?.fullName,
      });
    } catch (e) {
      console.error("Update failed", e);
      // Revert on failure
      load();
    }
    setUpdating(false);
  };

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Daily Board</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400">{today}</p>
            {updating && (
              <span className="text-xs text-blue-500 animate-pulse">● Saving...</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
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
        <DragDropContext onDragEnd={onDragEnd}>
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
        </DragDropContext>
      )}

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
