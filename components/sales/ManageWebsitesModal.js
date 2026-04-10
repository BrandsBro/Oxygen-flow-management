"use client";
import { useState } from "react";
import { createWebsite, updateWebsite } from "@/lib/api";
import { X, Plus, Globe } from "lucide-react";

export default function ManageWebsitesModal({ open, onClose, websites, onUpdated }) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!newName) return;
    setAdding(true);
    await createWebsite({ name: newName });
    setNewName("");
    onUpdated?.();
    setAdding(false);
  };

  const handleToggle = async (id, currentStatus) => {
    await updateWebsite({ id, status: currentStatus === "Active" ? "Inactive" : "Active" });
    onUpdated?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Globe size={16} className="text-purple-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Manage Websites</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="space-y-2">
            {websites.map(w => (
              <div key={w["Website ID"]} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="text-sm font-medium text-gray-700">{w["Website Name"]}</span>
                </div>
                <button onClick={() => handleToggle(w["Website ID"], w["Status"])}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                    w["Status"] === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {w["Status"]}
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add New Website</p>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Website name"
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <button onClick={handleAdd} disabled={adding || !newName}
                className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-300 text-white text-sm px-3 py-2 rounded-xl transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
