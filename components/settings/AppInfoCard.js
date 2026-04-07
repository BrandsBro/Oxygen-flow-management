export default function AppInfoCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
      <p className="text-sm font-semibold text-gray-700">App Info</p>
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-400">System Name</p>
          <p className="text-sm text-gray-700">Oxygen Flow Management</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Version</p>
          <p className="text-sm text-gray-700">1.0.0</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Database</p>
          <p className="text-sm text-gray-700">Google Sheets</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Built with</p>
          <p className="text-sm text-gray-700">Next.js + Vercel</p>
        </div>
      </div>
    </div>
  );
}
