"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createTicket, getMembers } from "@/lib/api";
import { X } from "lucide-react";

const issueTypes = [
  "General Support", "Order Issue", "Shipping Delay", "Address Issue",
  "Refund Request", "Return Request", "Replacement Request",
  "Chargeback", "Payment Issue", "Tracking Issue",
  "Product Question", "Escalation"
];
const priorities = ["Low", "Medium", "High", "Urgent"];
const statuses = [
  "New", "Assigned", "In Progress", "Waiting for Customer",
  "Waiting for Carrier", "Waiting for Internal Review",
  "Pending", "Solved", "Closed", "Overdue", "Blocked"
];
const channels = ["Email", "Messenger", "Phone Call", "Shopify", "PayPal", "Stripe", "Carrier"];

const defaultForm = {
  title: "", customerName: "", orderNumber: "",
  issueType: "General Support", priority: "Medium",
  status: "New", channel: "", assignedTo: "",
  dueDate: "", description: "", internalNotes: "", proofLink: "",
};

export default function NewTaskModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    getMembers().then((res) => { if (res.success) setMembers(res.data); });
  }, []);

  useEffect(() => {
    if (open) { setForm(defaultForm); setError(""); }
  }, [open]);

  // Close on ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async () => {
    if (!form.title) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await createTicket({ ...form, createdBy: user?.fullName });
      if (res.success) {
        onCreated?.();
        onClose();
      } else {
        setError("Failed to create task. Try again.");
      }
    } catch {
      setError("Something went wrong.");
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-semibold text-gray-800">Create New Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Enter task title"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>

          {/* Customer Name + Order Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                placeholder="Customer name"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
              <input
                type="text"
                value={form.orderNumber}
                onChange={(e) => set("orderNumber", e.target.value)}
                placeholder="Order #"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Issue Type + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
              <select
                value={form.issueType}
                onChange={(e) => set("issueType", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                {issueTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                {priorities.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Status + Channel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                {statuses.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={form.channel}
                onChange={(e) => set("channel", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Select channel</option>
                {channels.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Assign To + Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                value={form.assignedTo}
                onChange={(e) => set("assignedTo", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="">Select member</option>
                {members.map((m) => (
                  <option key={m["Member ID"]} value={m["Full Name"]}>
                    {m["Full Name"]} ({m["Role"]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the issue..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* Internal Notes + Proof Link */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
              <textarea
                value={form.internalNotes}
                onChange={(e) => set("internalNotes", e.target.value)}
                placeholder="Internal notes..."
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proof / Reference Link</label>
              <input
                type="url"
                value={form.proofLink}
                onChange={(e) => set("proofLink", e.target.value)}
                placeholder="https://"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? "Creating..." : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}
