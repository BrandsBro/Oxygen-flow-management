export default function MemberStatsTable({ tickets }) {
  const members = ["Sium", "Mehedi", "Nazmul"];

  const rows = members.map((m) => {
    const mine = tickets.filter(t => t["Assigned To"]?.includes(m));
    return {
      name: m,
      total:      mine.length,
      completed:  mine.filter(t => ["Solved","Closed"].includes(t["Status"])).length,
      pending:    mine.filter(t => ["Pending","Waiting for Customer","Waiting for Carrier","Waiting for Internal Review"].includes(t["Status"])).length,
      overdue:    mine.filter(t => t["Status"] === "Overdue").length,
      refunds:    mine.filter(t => t["Issue Type"] === "Refund Request").length,
      returns:    mine.filter(t => t["Issue Type"] === "Return Request").length,
      chargebacks:mine.filter(t => t["Issue Type"] === "Chargeback").length,
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-700">Member Breakdown</p>
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
            <th className="px-4 py-3 text-left">Member</th>
            <th className="px-4 py-3 text-center">Total</th>
            <th className="px-4 py-3 text-center">Completed</th>
            <th className="px-4 py-3 text-center">Pending</th>
            <th className="px-4 py-3 text-center">Overdue</th>
            <th className="px-4 py-3 text-center">Refunds</th>
            <th className="px-4 py-3 text-center">Returns</th>
            <th className="px-4 py-3 text-center">Chargebacks</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-700">{r.name}</td>
              <td className="px-4 py-3 text-center text-gray-600">{r.total}</td>
              <td className="px-4 py-3 text-center text-green-600 font-medium">{r.completed}</td>
              <td className="px-4 py-3 text-center text-yellow-600">{r.pending}</td>
              <td className="px-4 py-3 text-center text-red-600">{r.overdue}</td>
              <td className="px-4 py-3 text-center text-gray-500">{r.refunds}</td>
              <td className="px-4 py-3 text-center text-gray-500">{r.returns}</td>
              <td className="px-4 py-3 text-center text-gray-500">{r.chargebacks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
