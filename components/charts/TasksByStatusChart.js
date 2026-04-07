"use client";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = [
  "#3b82f6","#22c55e","#f59e0b","#ef4444",
  "#a855f7","#f97316","#06b6d4","#84cc16"
];

export default function TasksByStatusChart({ stats }) {
  const data = Object.entries(stats)
    .filter(([key, val]) => key !== "Total Tickets" && val > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-700 mb-4">Tasks by Status</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
