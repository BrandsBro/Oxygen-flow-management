"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { clockIn, clockOut, pauseClock, resumeClock, getAttendance } from "@/lib/api";
import { LogIn, LogOut, Pause, Play, Clock } from "lucide-react";

function to12hr(time24) {
  if (!time24) return "—";
  const [h, m] = time24.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

// Normalize log object — always lowercase keys
function normalizeLog(log) {
  if (!log) return null;
  return {
    logId:          log["Log ID"]           || log.logId          || "",
    member:         log["Member Name"]       || log.member         || "",
    date:           log["Date"]              || log.date           || "",
    clockIn:        log["Clock In"]          || log.clockIn        || "",
    clockOut:       log["Clock Out"]         || log.clockOut       || "",
    totalHours:     log["Total Hours"]       || log.totalHours     || "",
    status:         log["Status"]            || log.status         || "",
    pauseStart:     log["Pause Start"]       || log.pauseStart     || "",
    totalPauseMins: log["Total Pause Mins"]  || log.totalPauseMins || 0,
    pauseCount:     log["Pause Count"]       || log.pauseCount     || 0,
  };
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
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Work timer — only runs when Active
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (todayLog?.status === "Active" && todayLog?.clockIn) {
      const [inH, inM] = todayLog.clockIn.split(":").map(Number);
      const now = new Date();
      const totalMins = (now.getHours() * 60 + now.getMinutes()) - (inH * 60 + inM);
      const pauseMins = Number(todayLog.totalPauseMins) || 0;
      const workSecs  = Math.max(0, (totalMins - pauseMins) * 60);
      setElapsedSeconds(workSecs);
      timerRef.current = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [todayLog?.status]);

  async function load() {
    if (!user?.fullName) return;
    const member = isAdmin ? null : user.fullName;
    const res = await getAttendance(member);
    if (res.success) {
      // Normalize all logs
      const normalized = res.data.map(normalizeLog);

      // Sort newest first
      const sorted = normalized.sort((a, b) => {
        const parse = (s) => {
          if (!s) return 0;
          // Handle both MM/DD/YYYY and DD/MM/YYYY by trying both
          const parts = s.split("/");
          if (parts.length === 3) return new Date(`${parts[2]}-${parts[0]}-${parts[1]}`).getTime();
          return 0;
        };
        return parse(b.date) - parse(a.date);
      });

      setLogs(sorted);

      // Find today's log for current user — match by checking if it has no clockOut and is recent
      // Use multiple strategies to find today's log
      const todayRaw = res.data.find(l => {
        const memberMatch = l["Member Name"] === user.fullName;
        const noClockOut  = !l["Clock Out"] || String(l["Clock Out"]).trim() === "";
        const hasClockIn  = l["Clock In"] && String(l["Clock In"]).trim() !== "";
        // Active or Paused = today's session
        const isActive = l["Status"] === "Active" || l["Status"] === "Paused";
        return memberMatch && hasClockIn && noClockOut && isActive;
      });

      if (todayRaw) {
        setTodayLog(normalizeLog(todayRaw));
      } else {
        // Check if completed today
        const today = new Date();
        const mm = String(today.getMonth()+1).padStart(2,"0");
        const dd = String(today.getDate()).padStart(2,"0");
        const yyyy = today.getFullYear();
        // Try both formats
        const todayFormats = [
          `${mm}/${dd}/${yyyy}`,
          `${dd}/${mm}/${yyyy}`,
        ];

        const completedToday = res.data.find(l => {
          return l["Member Name"] === user.fullName &&
            todayFormats.some(fmt => l["Date"] === fmt);
        });

        setTodayLog(completedToday ? normalizeLog(completedToday) : null);
      }
    }
    setLoading(false);
  }

  useEffect(() => { if (user?.fullName) load(); }, [user?.fullName]);

  const handleClockIn = async () => {
    setActionLoading(true); setMessage(""); setError("");
    const res = await clockIn(user.fullName);
    if (res.success) {
      setMessage(res.message);
      // Optimistic update
      const now = new Date();
      setTodayLog({
        member: user.fullName,
        date: "",
        clockIn: `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`,
        clockOut: "",
        totalHours: "",
        status: "Active",
        pauseStart: "",
        totalPauseMins: 0,
        pauseCount: 0,
      });
      setElapsedSeconds(0);
      setTimeout(async () => { await load(); setActionLoading(false); }, 2000);
    } else { setError(res.message); setActionLoading(false); }
  };

  const handlePause = async () => {
    setActionLoading(true); setMessage(""); setError("");
    if (timerRef.current) clearInterval(timerRef.current);
    const res = await pauseClock(user.fullName);
    if (res.success) {
      setMessage(res.message);
      // Optimistic update
      setTodayLog(prev => prev ? { ...prev, status: "Paused" } : prev);
      setTimeout(async () => { await load(); setActionLoading(false); }, 2000);
    } else { setError(res.message); setActionLoading(false); }
  };

  const handleResume = async () => {
    setActionLoading(true); setMessage(""); setError("");
    const res = await resumeClock(user.fullName);
    if (res.success) {
      setMessage(res.message);
      // Optimistic update
      setTodayLog(prev => prev ? { ...prev, status: "Active", pauseStart: "" } : prev);
      setTimeout(async () => { await load(); setActionLoading(false); }, 2000);
    } else { setError(res.message); setActionLoading(false); }
  };

  const handleClockOut = async () => {
    setActionLoading(true); setMessage(""); setError("");
    if (timerRef.current) clearInterval(timerRef.current);
    const res = await clockOut(user.fullName);
    if (res.success) {
      setMessage(`${res.message} • Work: ${res.totalHours} hrs`);
      setTodayLog(prev => prev ? { ...prev, status: "Completed" } : prev);
      setTimeout(async () => { await load(); setActionLoading(false); }, 2000);
    } else { setError(res.message); setActionLoading(false); }
  };

  const isWorking  = todayLog?.status === "Active";
  const isPaused   = todayLog?.status === "Paused";
  const isDone     = todayLog?.status === "Completed";
  const notStarted = !todayLog;

  const hours12 = currentTime.getHours() % 12 || 12;
  const minutes = String(currentTime.getMinutes()).padStart(2,"0");
  const seconds = String(currentTime.getSeconds()).padStart(2,"0");
  const ampm    = currentTime.getHours() >= 12 ? "PM" : "AM";
  const completedDays = logs.filter(l => l.member === user?.fullName && l.status === "Completed").length;

  function displayDate(s) {
    if (!s) return "—";
    const parts = s.split("/");
    if (parts.length === 3) return `${parts[1]}/${parts[0]}/${parts[2]}`;
    return s;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Attendance</h1>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Clock Widget */}
        <div className="col-span-1">
          <div className="bg-gray-950 rounded-2xl p-6 text-center space-y-4">
            <div>
              <div className="flex items-end justify-center gap-1">
                <p className="text-4xl font-bold text-white font-mono">{hours12}:{minutes}:{seconds}</p>
                <p className="text-lg font-bold text-blue-400 mb-0.5">{ampm}</p>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
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

            {/* Status */}
            <div className={`rounded-xl px-4 py-2 text-sm font-medium ${
              isWorking ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              isPaused  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
              isDone    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              "bg-gray-800 text-gray-400"
            }`}>
              {isWorking ? "● Working" : isPaused ? "⏸ On Break" : isDone ? "✓ Completed" : "○ Not Started"}
            </div>

            {/* Work Timer */}
            {isWorking && (
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Work Time</p>
                <p className="text-2xl font-bold text-green-400 font-mono">{formatDuration(elapsedSeconds)}</p>
              </div>
            )}

            {/* Paused info */}
            {isPaused && (
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">⏸ On Break</p>
                {todayLog?.pauseStart && (
                  <p className="text-sm text-yellow-400 font-medium">Since {to12hr(todayLog.pauseStart)}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Breaks: {todayLog?.pauseCount || 0}</p>
              </div>
            )}

            {/* Today Summary */}
            {todayLog && (
              <div className="bg-gray-900 rounded-xl p-3 space-y-2 text-xs">
                {todayLog.clockIn && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clock In</span>
                    <span className="text-green-400 font-medium">{to12hr(todayLog.clockIn)}</span>
                  </div>
                )}
                {todayLog.clockOut && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clock Out</span>
                    <span className="text-red-400 font-medium">{to12hr(todayLog.clockOut)}</span>
                  </div>
                )}
                {Number(todayLog.totalPauseMins) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Break Time</span>
                    <span className="text-yellow-400 font-medium">{todayLog.totalPauseMins} mins</span>
                  </div>
                )}
                {todayLog.totalHours && (
                  <div className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-gray-500">Work Hours</span>
                    <span className="text-blue-400 font-bold">{todayLog.totalHours}</span>
                  </div>
                )}
              </div>
            )}

            {message && <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2"><p className="text-green-400 text-xs">{message}</p></div>}
            {error   && <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"><p className="text-red-400 text-xs">{error}</p></div>}

            {/* Buttons */}
            <div className="space-y-2">
              {notStarted && (
                <button onClick={handleClockIn} disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-semibold py-3 rounded-xl transition-colors">
                  <LogIn size={16} />{actionLoading ? "Saving..." : "Clock In"}
                </button>
              )}
              {isWorking && (
                <>
                  <button onClick={handlePause} disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-white font-semibold py-3 rounded-xl transition-colors">
                    <Pause size={16} />{actionLoading ? "Saving..." : "Pause"}
                  </button>
                  <button onClick={handleClockOut} disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-semibold py-3 rounded-xl transition-colors">
                    <LogOut size={16} />{actionLoading ? "Saving..." : "Clock Out"}
                  </button>
                </>
              )}
              {isPaused && (
                <>
                  <button onClick={handleResume} disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white font-semibold py-3 rounded-xl transition-colors">
                    <Play size={16} />{actionLoading ? "Saving..." : "Resume"}
                  </button>
                  <button onClick={handleClockOut} disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 disabled:bg-red-900 text-white font-semibold py-3 rounded-xl transition-colors">
                    <LogOut size={16} />{actionLoading ? "Saving..." : "Clock Out"}
                  </button>
                </>
              )}
              {isDone && (
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
                      <th className="px-4 py-3 text-left">Break</th>
                      <th className="px-4 py-3 text-left">Work Hours</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
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
                        <td className="px-4 py-3 text-gray-600 font-medium">{displayDate(log.date)}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold">{to12hr(log.clockIn)}</td>
                        <td className="px-4 py-3 text-red-500 font-semibold">{to12hr(log.clockOut)}</td>
                        <td className="px-4 py-3 text-yellow-600 font-medium">
                          {Number(log.totalPauseMins) > 0 ? `${log.totalPauseMins} mins` : "—"}
                        </td>
                        <td className="px-4 py-3 text-blue-600 font-semibold">{log.totalHours || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === "Completed" ? "bg-green-100 text-green-700" :
                            log.status === "Active"    ? "bg-blue-100 text-blue-700" :
                            log.status === "Paused"    ? "bg-yellow-100 text-yellow-700" :
                            "bg-gray-100 text-gray-500"
                          }`}>{log.status || "—"}</span>
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
