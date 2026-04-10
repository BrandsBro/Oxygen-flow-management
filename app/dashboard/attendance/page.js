"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { clockIn, clockOut, getAttendance } from "@/lib/api";
import { LogIn, LogOut } from "lucide-react";

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

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  async function load() {
    const member = isAdmin ? null : user?.fullName;
    const res = await getAttendance(member);
    if (res.success) {
      // Group by member + date → one row per day
      const grouped = {};
      res.data.forEach((log) => {
        const key = `${log["Member Name"]}_${log["Date"]}`;
        if (!grouped[key]) {
          grouped[key] = {
            member: log["Member Name"],
            date:   log["Date"],
            clockIn:    log["Clock In"]    || "",
            clockOut:   log["Clock Out"]   || "",
            totalHours: log["Total Hours"] || "",
            status:     log["Status"]      || "",
          };
        } else {
          // Keep first clock in
          if (!grouped[key].clockIn && log["Clock In"]) {
            grouped[key].clockIn = log["Clock In"];
          }
          // Keep last clock out
          if (log["Clock Out"]) {
            grouped[key].clockOut   = log["Clock Out"];
            grouped[key].totalHours = log["Total Hours"];
            grouped[key].status     = log["Status"];
          }
        }
      });

      const grouped_arr = Object.values(grouped).sort((a, b) => {
        const dateA = a.date.split("/").reverse().join("-");
        const dateB = b.date.split("/").reverse().join("-");
        return new Date(dateB) - new Date(dateA);
      });

      setLogs(grouped_arr);

      // Find today's raw log for current user
      const today = new Date().toLocaleDateString("en-GB");
      const todayKey = `${user?.fullName}_${today}`;
      setTodayLog(grouped[todayKey] || null);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleClockIn = async () => {
    setActionLoading(true);
    setMessage(""); setError("");
    const res = await clockIn(user?.fullName);
    if (res.success) { setMessage(res.message); await load(); }
    else setError(res.message);
    setActionLoading(false);
  };

  const handleClockOut = async () => {
    setActionLoading(true);
    setMessage(""); setError("");
    const res = await clockOut(user?.fullName);
    if (res.success) {
      setMessage(`${res.message} • Total: ${res.totalHours} hrs`);
      await load();
    } else setError(res.message);
    setActionLoading(false);
  };

  const isClockedIn  = todayLog && todayLog.clockIn && !todayLog.clockOut;
  const isClockedOut = todayLog && todayLog.clockIn && todayLog.clockOut;

  return (
    <div className="p-6 space-y-5">
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
          <div className="bg-gray-950 rounded-2xl p-6 text-center space-y-4">
            {/* Live Time */}
            <div>
              <p className="text-4xl font-bold text-white font-mono tracking-wide">
                {currentTime.toLocaleTimeString("en-GB", {
                  hour: "2-digit", minute: "2-digit", second: "2-digit"
                })}
              </p>
              <p className="text-gray-400 text-sm mt-1">{user?.fullName}</p>
              <p className="text-gray-600 text-xs">{user?.role}</p>
            </div>

            {/* Status */}
            <div className={`rounded-xl px-4 py-2 text-sm font-medium ${
              isClockedIn  ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              isClockedOut ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              "bg-gray-800 text-gray-400"
            }`}>
              {isClockedIn  ? "● Currently Working" :
               isClockedOut ? "✓ Shift Completed"   :
               "Not clocked in today"}
            </div>

            {/* Today summary */}
            {todayLog && (
              <div className="bg-gray-900 rounded-xl p-3 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Clock In</span>
                  <span className="text-green-400 font-medium">{todayLog.clockIn || "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Clock Out</span>
                  <span className="text-red-400 font-medium">{todayLog.clockOut || "—"}</span>
                </div>
                {todayLog.totalHours && (
                  <div className="flex justify-between items-center pt-1 border-t border-gray-800">
                    <span className="text-gray-500">Total Hours</span>
                    <span className="text-blue-400 font-bold">{todayLog.totalHours}</span>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {message && <p className="text-green-400 text-xs">{message}</p>}
            {error   && <p className="text-red-400 text-xs">{error}</p>}

            {/* Buttons */}
            <div className="space-y-2">
              {!todayLog && (
                <button
                  onClick={handleClockIn}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  <LogIn size={16} />
                  {actionLoading ? "Processing..." : "Clock In"}
                </button>
              )}
              {isClockedIn && (
                <button
                  onClick={handleClockOut}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  <LogOut size={16} />
                  {actionLoading ? "Processing..." : "Clock Out"}
                </button>
              )}
              {isClockedOut && (
                <div className="text-gray-500 text-xs py-2">
                  Shift completed for today ✓
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {isAdmin ? "All Attendance Logs" : "My Attendance History"}
              </p>
              <span className="text-xs text-gray-400">{logs.length} days</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm animate-pulse">
                Loading...
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
                No attendance records yet
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
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
                    {logs.map((log, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        {isAdmin && (
                          <td className="px-4 py-3 font-medium text-gray-700">
                            {log.member}
                          </td>
                        )}
                        <td className="px-4 py-3 text-gray-600 font-medium">{log.date}</td>
                        <td className="px-4 py-3 text-green-600 font-medium">{log.clockIn || "—"}</td>
                        <td className="px-4 py-3 text-red-500 font-medium">{log.clockOut || "—"}</td>
                        <td className="px-4 py-3 text-blue-600 font-medium">{log.totalHours || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            log.status === "Completed" ? "bg-blue-100 text-blue-700" :
                            log.status === "Active"    ? "bg-green-100 text-green-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>
                            {log.status || "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
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
