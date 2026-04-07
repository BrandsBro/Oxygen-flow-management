export default function TicketDescription({ form, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Description</p>
      <textarea
        value={form.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
        placeholder="Describe the issue..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none"
      />
    </div>
  );
}
