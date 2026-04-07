import { ExternalLink } from "lucide-react";

export default function TicketProofLink({ form, onChange }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <p className="text-sm font-semibold text-gray-700">Proof / Reference Link</p>
      <div className="flex gap-2">
        <input
          type="url"
          value={form.proofLink}
          onChange={(e) => onChange("proofLink", e.target.value)}
          placeholder="https://"
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        {form.proofLink && (
          
            href={form.proofLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm px-3 py-2 border border-blue-200 rounded-lg"
          >
            <ExternalLink size={14} /> Open
          </a>
        )}
      </div>
    </div>
  );
}
