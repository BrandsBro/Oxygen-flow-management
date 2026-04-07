"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PerformanceChart({ tickets }) {
  const members = ["Sium", "Mehedi", "Nazmul"];
  const data = members.map((m) => {
    const mine = tickets.filter(t => t["Assigned To"]?.includes(m));
    return {
      name: m,
      Completed: mine.filter(t => ["Solved","Closed"].includes(t["Status"])).length,
      Pending:   mine.filter(t => t["Status"] === "Pending").length,
      Overdue:   mine.filter(t => t["Status"] === "Overdue").length,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Performance by Member</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="Completed" fill="#22c55e" radius={[3,3,0,0]} />
          <Bar dataKey="Pending"   fill="#f59e0b" radius={[3,3,0,0]} />
          <Bar dataKey="Overdue"   fill="#ef4444" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
