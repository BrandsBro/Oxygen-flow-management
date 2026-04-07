"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function TasksByMemberChart({ tickets }) {
  const members = ["Sium", "Mehedi", "Nazmul"];
  const statuses = ["In Progress", "Solved", "Pending", "New"];
  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7"];

  const data = members.map((member) => {
    const obj = { name: member };
    statuses.forEach((s) => {
      obj[s] = tickets.filter(
        (t) => t["Assigned To"]?.includes(member) && t["Status"] === s
      ).length;
    });
    return obj;
  });

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 mb-4">Tasks by Team Member</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {statuses.map((s, i) => (
            <Bar key={s} dataKey={s} fill={colors[i]} radius={[3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
