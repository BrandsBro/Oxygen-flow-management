"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getMembers } from "@/lib/api";
import MyProfileCard from "@/components/authority/MyProfileCard";
import TeamMemberCard from "@/components/authority/TeamMemberCard";
import AddMemberModal from "@/components/authority/AddMemberModal";
import { UserPlus } from "lucide-react";

export default function AuthorityPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== "Admin") router.push("/dashboard");
  }, [user]);

  async function load() {
    const res = await getMembers();
    if (res.success) setMembers(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Other members (not current admin)
  const otherMembers = members.filter(m => m["Member ID"] !== user?.id);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Authority</h1>
          <p className="text-sm text-gray-400">Manage team members and credentials</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <UserPlus size={16} />
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* My Profile */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">My Profile</p>
          <MyProfileCard />
        </div>

        {/* Team Members */}
        <div className="col-span-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Team Members ({otherMembers.length})
          </p>
          {loading ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {otherMembers.map(m => (
                <TeamMemberCard key={m["Member ID"]} member={m} onUpdated={load} />
              ))}
            </div>
          )}
        </div>
      </div>

      <AddMemberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
