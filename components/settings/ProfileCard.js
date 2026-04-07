"use client";
import { useAuth } from "@/context/AuthContext";

export default function ProfileCard() {
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <p className="text-sm font-semibold text-gray-700">Profile</p>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
          {user?.fullName?.[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{user?.fullName}</p>
          <p className="text-sm text-gray-400">{user?.role}</p>
        </div>
      </div>
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-400">Name</p>
          <p className="text-sm text-gray-700">{user?.fullName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Email</p>
          <p className="text-sm text-gray-700">{user?.email || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Role</p>
          <p className="text-sm text-gray-700">{user?.role}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Username</p>
          <p className="text-sm text-gray-700">{user?.username}</p>
        </div>
      </div>
    </div>
  );
}
