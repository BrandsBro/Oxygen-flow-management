"use client";
import { useState } from "react";
import { updatePermissions } from "@/lib/api";
import { Save, Shield, User } from "lucide-react";

const pages = [
  { key: "tasks",       label: "All Tasks",       icon: "📋" },
  { key: "sales",       label: "Today's Sales",   icon: "💰" },
  { key: "my_tasks",    label: "My Tasks",         icon: "✅" },
  { key: "daily_board", label: "Daily Board",      icon: "📅" },
  { key: "attendance",  label: "Attendance",       icon: "⏰" },
  { key: "cases",       label: "Customer Cases",   icon: "👥" },
  { key: "reports",     label: "Reports",          icon: "📊" },
  { key: "team",        label: "Team",             icon: "👤" },
  { key: "invoices",    label: "Invoices",         icon: "🧾" },
];

const levels = [
  {
    value: "none",
    label: "No Access",
    color: "bg-gray-100 text-gray-500",
    dot: "bg-gray-300",
    desc: "Cannot see this page"
  },
  {
    value: "view",
    label: "View Only",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-400",
    desc: "Can view but not modify"
  },
  {
    value: "edit",
    label: "View + Add + Edit",
    color: "bg-yellow-100 text-yellow-700",
    dot: "bg-yellow-400",
    desc: "Can view, add and edit"
  },
  {
    value: "full",
    label: "Full Control",
    color: "bg-green-100 text-green-700",
    dot: "bg-green-400",
    desc: "Can view, add, edit and delete"
  },
];

export default function PermissionsCard({ member, permission, onUpdated }) {
  const [perms, setPerms] = useState({
    tasks:       permission?.tasks       || "none",
    sales:       permission?.sales       || "view",
    my_tasks:    permission?.my_tasks    || "view",
    daily_board: permission?.daily_board || "view",
    attendance:  permission?.attendance  || "view",
    cases:       permission?.cases       || "none",
    reports:     permission?.reports     || "none",
    team:        permission?.team        || "none",
    invoices:    permission?.invoices    || "none",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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

  const getLevelInfo = (val) => levels.find(l => l.value === val) || levels[0];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gray-950 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {member["Full Name"]?.[0]}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{member["Full Name"]}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {member["Role"] === "Admin"
                ? <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full flex items-center gap-1"><Shield size={10} /> Admin</span>
                : <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full flex items-center gap-1"><User size={10} /> Agent</span>
              }
            </div>
          </div>
        </div>
        {message && <span className="text-green-400 text-xs font-medium">✓ {message}</span>}
      </div>

      {member["Role"] === "Admin" ? (
        <div className="p-5">
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-4 text-center">
            <Shield size={20} className="text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-700">Full Admin Access</p>
            <p className="text-xs text-purple-400 mt-1">Admin has unrestricted access to all pages and actions</p>
          </div>
        </div>
      ) : (
        <div className="p-5 space-y-4">
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2">
            {levels.map(l => (
              <div key={l.value} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${l.dot}`} />
                <span className="text-xs text-gray-500">{l.label}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            {pages.map(({ key, label, icon }) => {
              const current = getLevelInfo(perms[key]);
              return (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{icon}</span>
                    <span className="text-sm text-gray-700 truncate">{label}</span>
                  </div>
                  <select
                    value={perms[key]}
                    onChange={e => setPerms(p => ({ ...p, [key]: e.target.value }))}
                    className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer ${current.color}`}
                  >
                    {levels.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>

          <button onClick={handleSave} disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-xl text-sm transition-colors">
            <Save size={14} />
            {saving ? "Saving..." : "Save Permissions"}
          </button>
        </div>
      )}
    </div>
  );
}
