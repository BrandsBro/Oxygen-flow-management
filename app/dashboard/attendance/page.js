"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { clockIn, clockOut, getAttendance } from "@/lib/api";
import { LogIn, LogOut, Clock } from "lucide-react";

function to12hr(time24) {
  if (!time24) return "—";
  const [h, m] = time24.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const [logs, setLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function load() {
    const member = isAdmin ? null : user?.fullName;
    const res = await getAttendance(member);
    if (res.success) {
      const grouped = {};
      res.data.forEach((log) => {
        const key = `${log["Member Name"]}_${log["Date"]}`;
        if (!grouped[key]) {
          grouped[key] = {
            member:     log["Member Name"],
            date:       log["Date"],
            clockIn:    log["Clock In"]    || "",
            clockOut:   log["Clock Out"]   || "",
            totalHours: log["Total Hours"] || "",
            status:     log["Status"]      || "",
          };
        } else {
          if (!grouped[key].clockIn && log["Clock In"]) grouped[key].clockIn = log["Clock In"];
          if (log["Clock Out"]) {
            grouped[key].clockOut   = log["Clock Out"];
            grouped[key].totalHours = log["Total Hours"];
            grouped[key].status     = log["Status"];
          }
        }
      });

      const arr = Object.values(grouped).sort((a, b) => {
        const da = a.date.split("/").reverse().join("-");
        const db = b.date.split("/").reverse().join("-");
        return new Date(db) - new Date(da);
      });

      setLogs(arr);
      const today = new Date().toLocaleDateString("en-GB");
      const todayKey = `${user?.fullName}_${today}`;
      setTodayLog(grouped[todayKey] || null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleClockIn = async () => {
    setActionLoading(true); setMessage(""); setError("");
    const res = await clockIn(user?.fullName);
    if (res.success) {
      setMessage(res.message);
      // Wait 1.5s for sheet to save then reload
      setTimeout(async () => {
        await load();
        setActionLoading(false);
      }, 1500);
    } else {
      setError(res.message);
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setActionLoading(true); setMessage(""); setError("");
    const res = await clockOut(user?.fullName);
    if (res.success) {
      setMessage(`${res.message} • Total: ${res.totalHours} hrs`);
      setTimeout(async () => {
        await load();
        setActionLoading(false);
      }, 1500);
    } else {
      setError(res.message);
      setActionLoading(false);
    }
  };

  const isClockedIn  = todayLog && todayLog.clockIn && !todayLog.clockOut;
  const isClockedOut = todayLog && todayLog.clockIn && todayLog.clockOut;

  const hours12 = currentTime.getHours() % 12 || 12;
  const minutes = String(currentTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentTime.getSeconds()).padStart(2, "0");
  const ampm    = currentTime.getHours() >= 12 ? "PM" : "AM";

  const completedDays = logs.filter(l => l.member === user?.fullName && l.status === "Completed").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
          })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Clock Widget */}
        <div className="col-span-1">
          <div className="bg-gray-950 rounded-2xl p-6 text-center space-y-5">
            <div>
              <div className="flex items-end justify-center gap-1">
                <p className="text-5xl font-bold text-white font-mono">
                  {hours12}:{minutes}:{seconds}
                </p>
                <p className="text-xl font-bold text-blue-400 mb-1">{ampm}</p>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric", month: "short", year: "numeric"
                })}
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]}
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{user?.fullName}</p>
                <p className="text-gray-500 text-xs">{user?.role}</p>
              </div>
            </div>

            <div className={`rounded-xl px-4 py-2.5 text-sm font-medium ${
              isClockedIn  ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              isClockedOut ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              "bg-gray-800 text-gray-400"
            }`}>
              {isClockedIn  ? "● Currently Working" :
               isClockedOut ? "✓ Shift Completed"   :
               "○ Not Clocked In"}
            </div>

            {todayLog && (
              <div className="bg-gray-900 rounded-xl p-4 space-y-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Today</p>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-gray-400 text-xs">Clock In</span>
                  </div>
                  <span className="text-green-400 font-bold text-sm">{to12hr(todayLog.clockIn)}</span>
                </div>
                {todayLog.clockOut && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span className="text-gray-400 text-xs">Clock Out</span>
                    </div>
                    <span className="text-red-400 font-bold text-sm">{to12hr(todayLog.clockOut)}</span>
                  </div>
                )}
                {todayLog.totalHours && (
                  <div className="flex justify-between items-center pt-2 border-t border-gray-800">
                    <span className="text-gray-400 text-xs">Total Hours</span>
                    <span className="text-blue-400 font-bold">{todayLog.totalHours}</span>
                  </div>
                )}
              </div>
            )}

            {message && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                <p className="text-green-400 text-xs">{message}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              {!todayLog && (
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  <LogIn size={18} />
                  {actionLoading ? "Saving..." : "Clock In"}
                </button>
              )}
              {isClockedIn && (
                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-semibold py-3.5 rounded-xl transition-colors"
                >
                  <LogOut size={18} />
                  {actionLoading ? "Saving..." : "Clock Out"}
                </button>
              )}
              {isClockedOut && (
                <div className="bg-gray-800 rounded-xl py-3 text-center">
                  <p className="text-gray-400 text-sm">✓ Done for today</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {isAdmin ? "All Attendance Records" : "My Attendance History"}
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">{completedDays} days completed</span>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{logs.length} records</span>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm animate-pulse">Loading...</div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                <Clock size={24} className="text-gray-300" />
                <p className="text-sm">No attendance records yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
                      {isAdmin && <th className="px-4 py-3 text-left">Member</th>}
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Clock In</th>
                      <th className="px-4 py-3 text-left">Clock Out</th>
                      <th className="px-4 py-3 text-left">Total Hours</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => {
                      const isToday = log.date === new Date().toLocaleDateString("en-GB");
                      return (
                        <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isToday ? "bg-blue-50/40" : ""}`}>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                  {log.member?.[0]}
                                </div>
                                <span className="font-medium text-gray-700">{log.member}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 text-gray-600 font-medium">
                            {log.date}
                            {isToday && (
                              <span className="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">Today</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-green-600 font-semibold">{to12hr(log.clockIn)}</td>
                          <td className="px-4 py-3 text-red-500 font-semibold">{to12hr(log.clockOut)}</td>
                          <td className="px-4 py-3 text-blue-600 font-semibold">{log.totalHours || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log.status === "Completed" ? "bg-green-100 text-green-700" :
                              log.status === "Active"    ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {log.status || "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
