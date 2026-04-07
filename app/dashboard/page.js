"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getStats, getTickets } from "@/lib/api";
import StatsCard from "@/components/StatsCard";
import RecentTasks from "@/components/RecentTasks";
import TasksByMemberChart from "@/components/charts/TasksByMemberChart";
import TasksByStatusChart from "@/components/charts/TasksByStatusChart";
import NewTaskModal from "@/components/NewTaskModal";
import {
  ListTodo, Clock, AlertTriangle, RefreshCw,
  CheckCircle, Zap, RotateCcw, Shield, CalendarDays
} from "lucide-react";

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-40 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl p-4 border-t-4 border-gray-200 shadow-sm h-24" />)}
      </div>
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => <div key={i} className="bg-white rounded-xl p-4 border-t-4 border-gray-200 shadow-sm h-24" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl h-72 shadow-sm" />
        <div className="bg-white rounded-xl h-72 shadow-sm" />
      </div>
      <div className="bg-white rounded-xl h-64 shadow-sm" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [tickets, setTickets] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading]);

  async function load() {
    const [s, t] = await Promise.all([getStats(), getTickets()]);
    if (s.success) setStats(s.data);
    if (t.success) setTickets(t.data);
    setFetching(false);
  }

  useEffect(() => { load(); }, []);

  const today = new Date().toDateString();
  const todayCount = tickets.filter(
    (t) => new Date(t["Created At"]).toDateString() === today
  ).length;

  if (loading || fetching) return <LoadingSkeleton />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400">Oxygen Concentrator Support Operations</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + New Task
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatsCard label="Total Tasks"  value={stats["Total Tickets"]}  icon={ListTodo}      accent="blue" />
        <StatsCard label="Pending"      value={stats["Pending"]}        icon={Clock}         accent="yellow" />
        <StatsCard label="Overdue"      value={stats["Overdue"]}        icon={AlertTriangle} accent="red" />
        <StatsCard label="In Progress"  value={stats["In Progress"]}    icon={RefreshCw}     accent="blue" />
        <StatsCard label="Completed"    value={stats["Solved"]}         icon={CheckCircle}   accent="green" />
      </div>

      <div className="grid grid-cols-5 gap-4">
        <StatsCard label="Urgent"      value={tickets.filter(t => t["Priority"] === "Urgent").length}           icon={Zap}          accent="red" />
        <StatsCard label="Refunds"     value={tickets.filter(t => t["Issue Type"] === "Refund Request").length} icon={RotateCcw}    accent="orange" />
        <StatsCard label="Returns"     value={tickets.filter(t => t["Issue Type"] === "Return Request").length} icon={RefreshCw}    accent="purple" />
        <StatsCard label="Chargebacks" value={tickets.filter(t => t["Issue Type"] === "Chargeback").length}     icon={Shield}       accent="red" />
        <StatsCard label="Today"       value={todayCount}                                                        icon={CalendarDays} accent="green" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TasksByMemberChart tickets={tickets} />
        <TasksByStatusChart stats={stats} />
      </div>

      <RecentTasks tickets={tickets} />

      <NewTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => load()}
      />
    </div>
  );
}
