import { Trash2 } from "lucide-react";

export default function DeleteConfirmModal({ open, onCancel, onConfirm, deleting }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-base font-semibold text-gray-800 mb-2">Delete Ticket?</h3>
        <p className="text-sm text-gray-400 mb-5">This action cannot be undone. The ticket will be permanently deleted.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 text-sm rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm rounded-lg py-2.5 transition-colors"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
