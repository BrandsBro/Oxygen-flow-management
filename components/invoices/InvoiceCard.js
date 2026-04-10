"use client";
import { useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import DeleteModal from "@/components/ui/DeleteModal";

export default function InvoiceCard({ invoice, onDelete }) {
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(invoice["Invoice ID"]);
    setDeleting(false);
    setShowDelete(false);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-gray-400">{invoice["Invoice ID"]}</p>
            <p className="font-semibold text-gray-800 text-sm mt-0.5">{invoice["Invoice Name"]}</p>
          </div>
          <p className="text-lg font-bold text-green-600">${Number(invoice["Amount"]).toLocaleString()}</p>
        </div>
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Date</span>
            <span className="text-gray-700 font-medium">{invoice["Date"]}</span>
          </div>
          <div className="flex justify-between">
            <span>Added By</span>
            <span className="text-gray-700 font-medium">{invoice["Added By"]}</span>
          </div>
          {invoice["Notes"] && (
            <div className="pt-1 border-t border-gray-50">
              <p className="text-gray-500 italic">{invoice["Notes"]}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          {invoice["Drive URL"] ? (
            <a href={invoice["Drive URL"]} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-xs font-medium">
              <ExternalLink size={12} /> View File
            </a>
          ) : <span className="text-xs text-gray-300">No file attached</span>}
          <button onClick={() => setShowDelete(true)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <DeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={handleDelete}
        deleting={deleting}
        title="Delete Invoice?"
        message={`"${invoice["Invoice Name"]}" will be permanently deleted.`}
      />
    </>
  );
}
