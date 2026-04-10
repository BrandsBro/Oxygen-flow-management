"use client";
import { useState } from "react";
import { updatePermissions } from "@/lib/api";
import { Save, Shield, User } from "lucide-react";

const pages = [
  { key: "my_tasks",    label: "My Tasks",       desc: "View own tasks" },
  { key: "daily_board", label: "Daily Board",     desc: "Kanban board view" },
  { key: "attendance",  label: "Attendance",      desc: "Clock in/out" },
  { key: "cases",       label: "Customer Cases",  desc: "View customer cases" },
  { key: "reports",     label: "Reports",         desc: "View reports & charts" },
  { key: "team",        label: "Team",            desc: "View team members" },
  { key: "invoices",    label: "Invoices",        desc: "View invoices" },
];

export default function PermissionsCard({ member, permission, onUpdated }) {
  const [perms, setPerms] = useState({
    my_tasks:    permission?.my_tasks    ?? true,
    daily_board: permission?.daily_board ?? true,
    attendance:  permission?.attendance  ?? true,
    cases:       permission?.cases       ?? false,
    reports:     permission?.reports     ?? false,
    team:        permission?.team        ?? false,
    invoices:    permission?.invoices    ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const toggle = (key) => setPerms(p => ({ ...p, [key]: !p[key] }));

  const handleSave = async () => {
    setSaving(true);
    const res = await updatePermissions({
      memberId:   member["Member ID"],
      memberName: member["Full Name"],
      ...perms
    });
    if (res.success) {
      setMessage("Saved!");
      onUpdated?.();
      setTimeout(() => setMessage(""), 2000);
    }
    setSaving(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {member["Full Name"]?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{member["Full Name"]}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {member["Role"] === "Admin"
              ? <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Shield size={10} /> Admin</span>
              : <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1"><User size={10} /> Agent</span>
            }
          </div>
        </div>
        {message && <span className="ml-auto text-green-500 text-xs font-medium">✓ {message}</span>}
      </div>

      {/* Admin always has full access */}
      {member["Role"] === "Admin" ? (
        <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 text-xs text-purple-600">
          Admin has full access to all pages by default.
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map(({ key, label, desc }) => (
            <div key={key} onClick={() => toggle(key)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${
                perms[key]
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-100 hover:bg-gray-100"
              }`}>
              <div>
                <p className={`text-sm font-medium ${perms[key] ? "text-blue-700" : "text-gray-500"}`}>{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <div className={`w-10 h-5 rounded-full transition-colors relative ${perms[key] ? "bg-blue-500" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${perms[key] ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
          ))}

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg text-sm transition-colors mt-2">
            <Save size={14} />
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      )}
    </div>
  );
}
