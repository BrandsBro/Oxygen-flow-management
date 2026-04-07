"use client";
import ProfileCard from "@/components/settings/ProfileCard";
import AppInfoCard from "@/components/settings/AppInfoCard";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { logout } = useAuth();
  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      <div className="grid grid-cols-2 gap-4 max-w-2xl">
        <ProfileCard />
        <AppInfoCard />
      </div>
      <div className="max-w-2xl">
        <button
          onClick={logout}
          className="w-full border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-3 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
