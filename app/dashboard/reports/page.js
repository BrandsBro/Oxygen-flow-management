"use client";
import { useEffect, useState } from "react";
import { getTickets } from "@/lib/api";
import PerformanceChart from "@/components/reports/PerformanceChart";
import IssueVolumeChart from "@/components/reports/IssueVolumeChart";
import MemberStatsTable from "@/components/reports/MemberStatsTable";

export default function ReportsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets().then((res) => {
      if (res.success) setTickets(res.data);
      setLoading(false);
    });
  }, []);

  const overdue = tickets.filter(t => t["Status"] === "Overdue").length;
  const total   = tickets.length;
  const ratio   = total > 0 ? ((overdue / total) * 100).toFixed(1) : 0;

  if (loading) return (
    <div className="p-6 animate-pulse space-y-4">
      <div className="h-6 w-32 bg-gray-200 rounded" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-64 bg-white rounded-xl shadow-sm" />
        <div className="h-64 bg-white rounded-xl shadow-sm" />
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Reports</h1>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <PerformanceChart tickets={tickets} />
        <IssueVolumeChart tickets={tickets} />
      </div>

      {/* Overdue ratio */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <p className="text-sm font-semibold text-gray-700">Overdue Ratio: <span className="text-red-500">{ratio}%</span></p>
        <p className="text-xs text-gray-400 mt-1">{overdue} overdue out of {total} total tasks</p>
        <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${ratio}%` }} />
        </div>
      </div>

      {/* Member Table */}
      <MemberStatsTable tickets={tickets} />
    </div>
  );
}
