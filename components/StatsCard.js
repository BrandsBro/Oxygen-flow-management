export default function StatsCard({ label, value, icon: Icon, accent }) {
  const accents = {
    blue:   "border-blue-400",
    yellow: "border-yellow-400",
    red:    "border-red-400",
    green:  "border-green-400",
    orange: "border-orange-400",
    purple: "border-purple-400",
    gray:   "border-gray-300",
  };

  return (
    <div className={`bg-white rounded-xl p-4 border-t-4 ${accents[accent] || accents.gray} shadow-sm flex justify-between items-start`}>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value ?? 0}</p>
      </div>
      <div className="text-gray-300">
        <Icon size={22} />
      </div>
    </div>
  );
}
