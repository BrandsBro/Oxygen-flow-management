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

function getTodayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function displayDate(s) {
  if (!s) return "";
  const [m, d, y] = s.split("/");
  return `${d}/${m}/${y}`;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
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

  // Timer state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Start/stop timer based on status
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (todayLog && todayLog.status === "Active") {
      // Calculate initial elapsed: (now - clockIn) - totalPauseMins
      const [inH, inM] = (todayLog.clockIn || "0:0").split(":").map(Number);
      const now = new Date();
      const totalMins = (now.getHours() * 60 + now.getMinutes()) - (inH * 60 + inM);
      const pauseMins = Number(todayLog.totalPauseMins) || 0;
      const workSecs  = Math.max(0, (totalMins - pauseMins) * 60);
      setElapsedSeconds(workSecs);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1);
      }, 1000);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [todayLog?.status]);

  async function load() {
    if (!user?.fullName) return;
    const member = isAdmin ? null : user.fullName;
    const res = await getAttendance(member);
    if (res.success) {
      const today = getTodayStr();
      const grouped = {};
      res.data.forEach((log) => {
        const key = `${log["Member Name"]}_${log["Date"]}`;
        if (!grouped[key]) grouped[key] = log;
      });

      const arr = Object.values(grouped).sort((a, b) => {
        const parse = (s) => { const [m,d,y] = s.split("/"); return new Date(`${y}-${m}-${d}`); };
        return parse(b["Date"]) - parse(a["Date"]);
      });

      setLogs(arr);
      const myToday = res.data.find(
        l => l["Member Name"] === user.fullName && l["Date"] === today
      );
      setTodayLog(myToday || null);
    }
    setLoading(false);
  }

  useEffect(() => { if (user?.fullName) load(); }, [user?.fullName]);

  const handleClockIn = async () => {
    setActionLoading(true); setMessage(""); setError("");
    const res = await clockIn(user.fullName);
    if (res.success) {
      setMessage(res.message);
      setElapsedSeconds(0);
      setTimeout(async () => { await load(); setActionLoading(false); }, 1500);
    } else { setError(res.message); setActionLoading(false); }
  };

  const handlePause = async () => {
    setActionLoading(true); setMessage(""); setError("");
    if (timerRef.current) clearInterval(timerRef.current);
    const res = await pauseClock(user.fullName);
    if (res.success) {
      setMessage(res.message);
      setTimeout(async () => { await load(); setActionLoading(false); }, 1500);
    } else { setError(res.message); setActionLoading(false); }
  };

  const handleResume = async () => {
    setActionLoading(true); setMessage(""); setError("");
    const res = await resumeClock(user.fullName);
    if (res.success) {
      setMessage(res.message);
      setTimeout(async () => { await load(); setActionLoading(false); }, 1500);
    } else { setError(res.message); setActionLoading(false); }
  };

  const handleClockOut = async () => {
    setActionLoading(true); setMessage(""); setError("");
    if (timerRef.current) clearInterval(timerRef.current);
    const res = await clockOut(user.fullName);
    if (res.success) {
      setMessage(`${res.message} • Work: ${res.totalHours} hrs`);
      if (res.totalPauseMins > 0) setMessage(m => m + ` • Paused: ${res.totalPauseMins} mins`);
      setTimeout(async () => { await load(); setActionLoading(false); }, 1500);
    } else { setError(res.message); setActionLoading(false); }
  };

  const status     = todayLog?.status || null;
  const isWorking  = status === "Active";
  const isPaused   = status === "Paused";
  const isDone     = status === "Completed";
  const notStarted = !todayLog;

  const hours12 = currentTime.getHours() % 12 || 12;
  const minutes = String(currentTime.getMinutes()).padStart(2,"0");
  const seconds = String(currentTime.getSeconds()).padStart(2,"0");
  const ampm    = currentTime.getHours() >= 12 ? "PM" : "AM";
  const completedDays = logs.filter(l => l["Member Name"] === user?.fullName && l["Status"] === "Completed").length;

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

            {/* Clock */}
            <div>
              <div className="flex items-end justify-center gap-1">
                <p className="text-4xl font-bold text-white font-mono">{hours12}:{minutes}:{seconds}</p>
                <p className="text-lg font-bold text-blue-400 mb-0.5">{ampm}</p>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })}
              </p>
            </div>

            {/* User */}
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
              {isWorking ? "● Working" : isPaused ? "⏸ Paused" : isDone ? "✓ Completed" : "○ Not Started"}
            </div>

            {/* Work Timer */}
            {isWorking && (
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">Work Time</p>
                <p className="text-2xl font-bold text-green-400 font-mono">{formatDuration(elapsedSeconds)}</p>
              </div>
            )}

            {isPaused && (
              <div className="bg-gray-900 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">⏸ On Break</p>
                <p className="text-sm text-yellow-400 font-medium">Paused at {to12hr(todayLog?.["Pause Start"])}</p>
                <p className="text-xs text-gray-500 mt-1">Breaks taken: {todayLog?.["Pause Count"] || 0}</p>
              </div>
            )}

            {/* Today Summary */}
            {todayLog && (
              <div className="bg-gray-900 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Clock In</span>
                  <span className="text-green-400 font-medium">{to12hr(todayLog["Clock In"])}</span>
                </div>
                {todayLog["Clock Out"] && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clock Out</span>
                    <span className="text-red-400 font-medium">{to12hr(todayLog["Clock Out"])}</span>
                  </div>
                )}
                {Number(todayLog["Total Pause Mins"]) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Break</span>
                    <span className="text-yellow-400 font-medium">{todayLog["Total Pause Mins"]} mins</span>
                  </div>
                )}
                {todayLog["Total Hours"] && (
                  <div className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-gray-500">Work Hours</span>
                    <span className="text-blue-400 font-bold">{todayLog["Total Hours"]}</span>
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
                  <LogIn size={16} />{actionLoading ? "Starting..." : "Clock In"}
                </button>
              )}

              {isWorking && (
                <>
                  <button onClick={handlePause} disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-800 text-white font-semibold py-3 rounded-xl transition-colors">
                    <Pause size={16} />{actionLoading ? "Pausing..." : "Pause"}
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
                    <Play size={16} />{actionLoading ? "Resuming..." : "Resume"}
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
                    {logs.map((log, i) => {
                      const isToday = log["Date"] === getTodayStr();
                      return (
                        <tr key={i} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${isToday ? "bg-blue-50/40" : ""}`}>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                  {log["Member Name"]?.[0]}
                                </div>
                                <span className="font-medium text-gray-700">{log["Member Name"]}</span>
                              </div>
                            </td>
                          )}
                          <td className="px-4 py-3 text-gray-600 font-medium">
                            {displayDate(log["Date"])}
                            {isToday && <span className="ml-2 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full text-xs">Today</span>}
                          </td>
                          <td className="px-4 py-3 text-green-600 font-semibold">{to12hr(log["Clock In"])}</td>
                          <td className="px-4 py-3 text-red-500 font-semibold">{to12hr(log["Clock Out"])}</td>
                          <td className="px-4 py-3 text-yellow-600 font-medium">
                            {Number(log["Total Pause Mins"]) > 0 ? `${log["Total Pause Mins"]} mins` : "—"}
                          </td>
                          <td className="px-4 py-3 text-blue-600 font-semibold">{log["Total Hours"] || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              log["Status"] === "Completed" ? "bg-green-100 text-green-700" :
                              log["Status"] === "Active"    ? "bg-blue-100 text-blue-700" :
                              log["Status"] === "Paused"    ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-500"
                            }`}>{log["Status"] || "—"}</span>
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
