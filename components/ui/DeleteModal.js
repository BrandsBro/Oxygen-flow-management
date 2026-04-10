"use client";
import { AlertTriangle } from "lucide-react";

export default function DeleteModal({ open, onCancel, onConfirm, deleting, title, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Red top bar */}
        <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-500" />
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={24} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title || "Delete Item?"}</h3>
            <p className="text-sm text-gray-400 mt-1">{message || "This action cannot be undone."}</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={deleting}
              className="flex-1 px-4 py-2.5 text-sm font-medium bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-xl transition-colors">
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
