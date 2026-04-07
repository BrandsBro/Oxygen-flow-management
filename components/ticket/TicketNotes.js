export default function TicketNotes({ form, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Internal Notes</p>
      <textarea
        value={form.internalNotes}
        onChange={(e) => onChange("internalNotes", e.target.value)}
        rows={3}
        placeholder="Internal notes (not visible to customer)..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
      />
    </div>
  );
}
