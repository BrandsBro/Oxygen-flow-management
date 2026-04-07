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
const members = ["Sium", "Mehedi", "Nazmul"];

export default function TicketSidebar({ form, onChange }) {
  return (
    <div className="space-y-4">

      {/* Status */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Status</p>
        <select
          value={form.status}
          onChange={(e) => onChange("status", e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
        >
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-700">Details</p>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => onChange("priority", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            {priorities.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Issue Type</label>
          <select
            value={form.issueType}
            onChange={(e) => onChange("issueType", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            {issueTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Channel</label>
          <select
            value={form.channel}
            onChange={(e) => onChange("channel", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="">Select channel</option>
            {channels.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Assigned To</label>
          <select
            value={form.assignedTo}
            onChange={(e) => onChange("assignedTo", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            <option value="">Select member</option>
            {members.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Due Date</label>
          <input
            type="datetime-local"
            value={form.dueDate}
            onChange={(e) => onChange("dueDate", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>
    </div>
  );
}
