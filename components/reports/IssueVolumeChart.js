"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#3b82f6","#22c55e","#f59e0b","#ef4444","#a855f7","#f97316","#06b6d4","#84cc16","#ec4899","#14b8a6"];

export default function IssueVolumeChart({ tickets }) {
  const countMap = {};
  tickets.forEach(t => {
    const type = t["Issue Type"] || "Unknown";
    countMap[type] = (countMap[type] || 0) + 1;
  });

  const data = Object.entries(countMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <p className="text-sm font-semibold text-gray-700 mb-4">Issue Volume by Type</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
