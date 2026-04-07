const statusColors = {
  "Pending":           "bg-yellow-100 text-yellow-800",
  "In Progress":       "bg-blue-100 text-blue-700",
  "Waiting for Customer": "bg-orange-100 text-orange-700",
  "Solved":            "bg-green-100 text-green-700",
  "Overdue":           "bg-red-100 text-red-700",
};

const responsibilities = {
  Sium:    ["Solves issues", "Chargebacks", "Refunds", "Returns"],
  Mehedi:  ["Email checks", "Messenger checks", "Issue checks"],
  Nazmul:  ["Follow up confirmation", "Messenger replies", "Picks calls", "Finds issues"],
};

export default function MemberCard({ member, tickets, onTicketClick }) {
  const firstName = member["Full Name"]?.split(" ")[0];
  const mine = tickets.filter(t => t["Assigned To"]?.includes(firstName));
  const active = mine.filter(t => !["Solved","Closed"].includes(t["Status"]));
  const initials = member["Full Name"]?.split(" ").map(w => w[0]).join("").toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{member["Full Name"]}</p>
          <p className="text-xs text-gray-400">{active.length} active tasks</p>
        </div>
      </div>

      {/* Role badge */}
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
        member["Role"] === "Admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"
      }`}>
        {member["Role"]}
      </span>

      {/* Responsibilities */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Responsibilities</p>
        <div className="flex flex-wrap gap-1.5">
          {(responsibilities[firstName] || []).map((r) => (
            <span key={r} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r}</span>
          ))}
        </div>
      </div>

      {/* Recent Tasks */}
      <div>
        <p className="text-xs text-gray-400 mb-2">Recent Tasks</p>
        {active.length === 0 ? (
          <p className="text-xs text-gray-300">No active tasks</p>
        ) : (
          <div className="space-y-2">
            {active.slice(0, 3).map((t) => (
              <div
                key={t["Ticket ID"]}
                onClick={() => onTicketClick(t["Ticket ID"])}
                className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-1.5 cursor-pointer transition-colors"
              >
                <div>
                  <span className="text-xs text-gray-400 font-mono mr-2">{t["Ticket ID"]}</span>
                  <span className="text-xs text-gray-700">{t["Title"]}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[t["Status"]] || "bg-gray-100 text-gray-500"}`}>
                  {t["Status"]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
