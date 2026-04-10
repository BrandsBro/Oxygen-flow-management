"use client";
import { useState } from "react";
import { updateMember } from "@/lib/api";
import { Save, Eye, EyeOff, Shield, User } from "lucide-react";

export default function TeamMemberCard({ member, onUpdated }) {
  const [fullName, setFullName] = useState(member["Full Name"] || "");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState(member["Designation"] || "");
  const [status, setStatus] = useState(member["Status"] || "Active");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true); setMessage(""); setError("");
    try {
      const updateData = {
        id: member["Member ID"], fullName, designation, status
      };
      if (password) updateData.password = password;
      const res = await updateMember(updateData);
      if (res.success) {
        setMessage("Updated!");
        setPassword("");
        onUpdated?.();
        setTimeout(() => setMessage(""), 2000);
      } else setError("Failed to update.");
    } catch { setError("Error."); }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
          {fullName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{member["Full Name"]}</p>
          <div className="flex items-center gap-1">
            {member["Role"] === "Admin"
              ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Shield size={10} /> Admin</span>
              : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1"><User size={10} /> Agent</span>
            }
            <span className={`text-xs px-2 py-0.5 rounded-full ${status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {message && <p className="text-green-600 text-xs font-medium">✓ {message}</p>}
      {error   && <p className="text-red-500 text-xs">{error}</p>}

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Designation</label>
          <input type="text" value={designation} onChange={e => setDesignation(e.target.value)}
            placeholder="e.g. Support Agent"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">New Password</label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Set new password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 pr-10" />
            <button onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-400 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
        <Save size={14} />
        {saving ? "Saving..." : "Update Member"}
      </button>
    </div>
  );
}
