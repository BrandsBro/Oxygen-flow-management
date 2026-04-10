"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { updateMember } from "@/lib/api";
import { Save, Eye, EyeOff } from "lucide-react";

export default function MyProfileCard() {
  const { user, login } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [password, setPassword] = useState("");
  const [designation, setDesignation] = useState(user?.designation || "");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!fullName) { setError("Name is required"); return; }
    setSaving(true); setMessage(""); setError("");
    try {
      const updateData = { id: user?.id, fullName, designation };
      if (password) updateData.password = password;
      const res = await updateMember(updateData);
      if (res.success) {
        setMessage("Profile updated successfully!");
        setPassword("");
        // Update cookie
        login({ ...user, fullName, designation });
      } else setError("Failed to update.");
    } catch { setError("Something went wrong."); }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
          {fullName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.fullName}</p>
          <p className="text-sm text-gray-400">{user?.role}</p>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-gray-100">
        <p className="text-sm font-semibold text-gray-700">My Profile</p>

        {message && <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">{message}</div>}
        {error   && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

        <div>
          <label className="block text-xs text-gray-500 mb-1">Full Name</label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Designation</label>
          <input type="text" value={designation} onChange={e => setDesignation(e.target.value)}
            placeholder="e.g. Support Manager"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">New Password <span className="text-gray-400">(leave blank to keep current)</span></label>
          <div className="relative">
            <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 pr-10" />
            <button onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
          <Save size={14} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
