"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMembers, getPermissions } from "@/lib/api";
import MyProfileCard from "@/components/authority/MyProfileCard";
import TeamMemberCard from "@/components/authority/TeamMemberCard";
import AddMemberModal from "@/components/authority/AddMemberModal";
import PermissionsCard from "@/components/authority/PermissionsCard";
import { UserPlus } from "lucide-react";

export default function AuthorityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState("credentials");

  useEffect(() => {
    if (user && user.role !== "Admin") router.push("/dashboard");
  }, [user]);

  async function load() {
    const [m, p] = await Promise.all([getMembers(), getPermissions()]);
    if (m.success) setMembers(m.data);
    if (p.success) setPermissions(p.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const otherMembers = members.filter(m => m["Member ID"] !== user?.id);

  const getPermForMember = (memberId) =>
    permissions.find(p => p["Member ID"] === memberId);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Authority</h1>
          <p className="text-sm text-gray-400">Manage team credentials and page access</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[
          { key: "credentials", label: "Credentials & Info" },
          { key: "permissions", label: "Page Access" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-xl h-64 shadow-sm" />)}
        </div>
      ) : tab === "credentials" ? (
        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Profile</p>
            <MyProfileCard />
          </div>
          <div className="col-span-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Team Members ({otherMembers.length})
            </p>
            <div className="grid grid-cols-2 gap-4">
              {otherMembers.map(m => (
                <TeamMemberCard key={m["Member ID"]} member={m} onUpdated={load} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Set which pages each member can access
          </p>
          <div className="grid grid-cols-3 gap-4">
            {members.map(m => (
              <PermissionsCard
                key={m["Member ID"]}
                member={m}
                permission={getPermForMember(m["Member ID"])}
                onUpdated={load}
              />
            ))}
          </div>
        </div>
      )}

      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
