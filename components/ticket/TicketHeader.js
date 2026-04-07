"use client";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  return isNaN(dt) ? "—" : dt.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export default function TicketHeader({ id, form, ticket, saving, saved, error, onSave, onDeleteClick, onChange }) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-3">
          {error && <span className="text-red-500 text-sm">{error}</span>}
          {saved && <span className="text-green-500 text-sm font-medium">✓ Saved!</span>}
          <button
            onClick={onDeleteClick}
            className="flex items-center gap-2 text-red-500 hover:text-red-600 border border-red-200 text-sm px-3 py-2 rounded-lg transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Save size={14} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Ticket Title Card */}
      <div className="bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{id}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColors[form.priority]}`}>{form.priority}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[form.status]}`}>{form.status}</span>
        </div>
        <input
          type="text"
          value={form.title}
          onChange={(e) => onChange("title", e.target.value)}
          className="text-xl font-bold text-gray-800 w-full focus:outline-none border-b border-transparent focus:border-blue-300 pb-1"
        />
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
          <span>Created: {fmt(ticket["Created At"])}</span>
          <span>Updated: {fmt(ticket["Updated At"])}</span>
          <span>By: {ticket["Created By"] || "—"}</span>
          {ticket["Resolved At"] && <span className="text-green-500">Resolved: {fmt(ticket["Resolved At"])}</span>}
        </div>
      </div>
    </div>
  );
}
