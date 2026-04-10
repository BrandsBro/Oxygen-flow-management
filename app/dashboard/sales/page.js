"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/context/PermissionContext";
import { getSales, deleteSale } from "@/lib/api";
import AddSaleModal from "@/components/sales/AddSaleModal";
import DeleteModal from "@/components/ui/DeleteModal";
import { ShoppingCart, TrendingUp, Package, Trash2, Plus, RefreshCw } from "lucide-react";

function getTodayStr() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

const channelColors = {
  "Shopify":    "bg-green-100 text-green-700",
  "Email":      "bg-blue-100 text-blue-700",
  "Messenger":  "bg-purple-100 text-purple-700",
  "Phone Call": "bg-yellow-100 text-yellow-700",
  "PayPal":     "bg-blue-100 text-blue-800",
  "Stripe":     "bg-indigo-100 text-indigo-700",
  "Website":    "bg-cyan-100 text-cyan-700",
  "Other":      "bg-gray-100 text-gray-600",
};

export default function SalesPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const canAdd    = can("sales", "add");
  const canDelete = can("sales", "delete");

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const today = getTodayStr();
    const res = await getSales(today);
    if (res.success) setSales(res.data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteSale(deleteTarget["Sale ID"]);
    setDeleting(false);
    setDeleteTarget(null);
    await load();
  };

  const totalRevenue  = sales.reduce((s, i) => s + (Number(i["Amount"]) || 0), 0);
  const totalOrders   = sales.length;
  const totalQuantity = sales.reduce((s, i) => s + (Number(i["Quantity"]) || 0), 0);

  const byChannel = {};
  sales.forEach(s => {
    const ch = s["Channel"] || "Other";
    if (!byChannel[ch]) byChannel[ch] = { count: 0, amount: 0 };
    byChannel[ch].count++;
    byChannel[ch].amount += Number(s["Amount"]) || 0;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Today's Sales</h1>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-2 border border-gray-200 text-gray-500 hover:text-gray-700 text-sm px-3 py-2 rounded-lg transition-colors">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          {canAdd && (
            <button onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus size={16} /> Add Sale
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Today's Revenue</p>
            <p className="text-2xl font-bold text-gray-800">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <ShoppingCart size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Orders</p>
            <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Package size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Quantity</p>
            <p className="text-2xl font-bold text-gray-800">{totalQuantity}</p>
          </div>
        </div>
      </div>

      {/* Channel Breakdown */}
      {Object.keys(byChannel).length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(byChannel).map(([ch, data]) => (
            <div key={ch} className="bg-white rounded-xl shadow-sm p-3 flex items-center justify-between">
              <div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${channelColors[ch] || "bg-gray-100 text-gray-600"}`}>{ch}</span>
                <p className="text-xs text-gray-400 mt-1">{data.count} orders</p>
              </div>
              <p className="text-sm font-bold text-gray-700">${data.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Sales Log</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{sales.length} sales</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm animate-pulse">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
            <ShoppingCart size={24} className="text-gray-300" />
            <p className="text-sm">No sales yet today</p>
            {canAdd && <button onClick={() => setModalOpen(true)} className="text-blue-500 text-xs hover:underline">Add first sale</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Sale ID</th>
                  <th className="px-4 py-3 text-left">Order ID</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Channel</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  {canDelete && <th className="px-4 py-3 text-left"></th>}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono">{sale["Sale ID"]}</td>
                    <td className="px-4 py-3 text-gray-600">{sale["Order ID"] || "—"}</td>
                    <td className="px-4 py-3 font-medium text-gray-700">{sale["Product"]}</td>
                    <td className="px-4 py-3 text-gray-500">{sale["Customer"] || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${channelColors[sale["Channel"]] || "bg-gray-100 text-gray-600"}`}>
                        {sale["Channel"] || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{sale["Quantity"] || "—"}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">${Number(sale["Amount"]).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{sale["Notes"] || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {sale["Added By"]?.[0]}
                        </div>
                        <span className="text-gray-500">{sale["Added By"]}</span>
                      </div>
                    </td>
                    {canDelete && (
                      <td className="px-4 py-3">
                        <button onClick={() => setDeleteTarget(sale)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={6} className="px-4 py-3 text-xs font-semibold text-gray-600">Total</td>
                  <td className="px-4 py-3 text-green-600 font-bold text-sm">${totalRevenue.toLocaleString()}</td>
                  <td colSpan={canDelete ? 3 : 2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {canAdd && <AddSaleModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => load()} />}

      <DeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
        title="Delete Sale?"
        message={`Sale "${deleteTarget?.["Product"]}" will be permanently deleted.`}
      />
    </div>
  );
}
