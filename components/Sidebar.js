"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPermissions } from "@/lib/api";
import {
  LayoutDashboard, ListTodo, User, CalendarDays,
  Users, FileText, UsersRound, Settings, LogOut,
  Clock, Receipt, ShieldCheck
} from "lucide-react";

const allNavItems = [
  { label: "Dashboard",      href: "/dashboard",            icon: LayoutDashboard, key: "dashboard",   adminOnly: false },
  { label: "All Tasks",      href: "/dashboard/tasks",      icon: ListTodo,        key: "all_tasks",   adminOnly: true  },
  { label: "My Tasks",       href: "/dashboard/mytasks",    icon: User,            key: "my_tasks",    adminOnly: false },
  { label: "Daily Board",    href: "/dashboard/daily",      icon: CalendarDays,    key: "daily_board", adminOnly: false },
  { label: "Attendance",     href: "/dashboard/attendance", icon: Clock,           key: "attendance",  adminOnly: false },
  { label: "Invoices",       href: "/dashboard/invoices",   icon: Receipt,         key: "invoices",    adminOnly: true  },
  { label: "Customer Cases", href: "/dashboard/cases",      icon: Users,           key: "cases",       adminOnly: true  },
  { label: "Reports",        href: "/dashboard/reports",    icon: FileText,        key: "reports",     adminOnly: true  },
  { label: "Team",           href: "/dashboard/team",       icon: UsersRound,      key: "team",        adminOnly: true  },
  { label: "Authority",      href: "/dashboard/authority",  icon: ShieldCheck,     key: "authority",   adminOnly: true  },
  { label: "Settings",       href: "/dashboard/settings",   icon: Settings,        key: "settings",    adminOnly: true  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [agentPerms, setAgentPerms] = useState(null);

  useEffect(() => {
    if (!isAdmin && user?.id) {
      getPermissions().then(res => {
        if (res.success) {
          const myPerm = res.data.find(p => p["Member ID"] === user.id);
          setAgentPerms(myPerm || null);
        }
      });
    }
  }, [user?.id]);

  const navItems = allNavItems.filter(item => {
    // Admins see everything
    if (isAdmin) return true;
    // Always show dashboard
    if (item.key === "dashboard") return true;
    // Hide admin-only pages
    if (item.adminOnly) return false;
    // Check permissions for agent
    if (agentPerms) return agentPerms[item.key] === true;
    // Default: show my_tasks, daily_board, attendance
    return ["my_tasks", "daily_board", "attendance"].includes(item.key);
  });

  return (
    <div className="w-48 bg-gray-950 flex flex-col h-full shrink-0">
      <div className="px-4 py-5 border-b border-gray-800">
        <p className="text-white font-bold text-sm">Oxygen Support</p>
        <p className="text-gray-500 text-xs">Support Desk</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.fullName?.[0] || "U"}
          </div>
          <div>
            <p className="text-white text-xs font-medium">{user?.fullName}</p>
            <p className="text-gray-500 text-xs">{user?.role}</p>
          </div>
        </div>
        <button onClick={logout}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-xs transition-colors">
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
