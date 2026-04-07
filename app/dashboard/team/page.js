"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMembers, getTickets } from "@/lib/api";
import MemberCard from "@/components/team/MemberCard";

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMembers(), getTickets()]).then(([m, t]) => {
      if (m.success) setMembers(m.data);
      if (t.success) setTickets(t.data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="p-6 animate-pulse">
      <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-white rounded-xl shadow-sm" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Team Management</h1>
        <p className="text-sm text-gray-400">{members.length} team members</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {members.map((m) => (
          <MemberCard
            key={m["Member ID"]}
            member={m}
            tickets={tickets}
            onTicketClick={(id) => router.push(`/dashboard/tasks/${id}`)}
          />
        ))}
      </div>
    </div>
  );
}
