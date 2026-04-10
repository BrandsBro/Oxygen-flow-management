"use client";
import { useState } from "react";
import { addMember } from "@/lib/api";
import { X, Eye, EyeOff } from "lucide-react";

const defaultForm = {
  fullName: "", username: "", password: "",
  role: "Agent", designation: ""
};

export default function AddMemberModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.fullName || !form.username || !form.password) {
      setError("Name, username and password are required"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await addMember(form);
      if (res.success) { onCreated?.(); onClose(); setForm(defaultForm); }
      else setError(res.message || "Failed to add member.");
    } catch { setError("Something went wrong."); }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Add New Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.fullName} onChange={e => set("fullName", e.target.value)}
              placeholder="e.g. John Smith"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
            <input type="text" value={form.designation} onChange={e => set("designation", e.target.value)}
              placeholder="e.g. Support Agent"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
              <input type="text" value={form.username} onChange={e => set("username", e.target.value)}
                placeholder="username"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
                <option>Agent</option>
                <option>Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)}
                placeholder="Set password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 pr-10" />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors">
            {loading ? "Adding..." : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}
