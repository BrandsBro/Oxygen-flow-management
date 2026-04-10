"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/context/PermissionContext";
import { getSales, deleteSale, getProducts, getWebsites } from "@/lib/api";
import AddSaleModal from "@/components/sales/AddSaleModal";
import EditSaleModal from "@/components/sales/EditSaleModal";
import ManageProductsModal from "@/components/sales/ManageProductsModal";
import ManageWebsitesModal from "@/components/sales/ManageWebsitesModal";
import DeleteModal from "@/components/ui/DeleteModal";
import {
  ShoppingCart, TrendingUp, Package, Trash2,
  Plus, RefreshCw, Edit3, Settings, Globe,
  BarChart3, Calendar, Filter
} from "lucide-react";

function getTodayStr() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

const websiteColors = {
  "OxygenGears":          "bg-blue-100 text-blue-700",
  "OxygenConcentrators":  "bg-green-100 text-green-700",
  "Oxlovo":               "bg-purple-100 text-purple-700",
  "OxygenCares":          "bg-orange-100 text-orange-700",
  "All":                  "bg-gray-100 text-gray-700",
};

export default function SalesPage() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const isAdmin   = user?.role === "Admin";
  const canAdd    = can("sales", "add");
  const canEdit   = can("sales", "edit");
  const canDelete = can("sales", "delete");

  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filterDate, setFilterDate] = useState(getTodayStr());
  const [filterWebsite, setFilterWebsite] = useState("");
  const [filterProduct, setFilterProduct] = useState("");

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [manageProducts, setManageProducts] = useState(false);
  const [manageWebsites, setManageWebsites] = useState(false);

  async function loadAll() {
    const [s, p, w] = await Promise.all([
      getSales(filterDate, filterWebsite, filterProduct),
      getProducts(),
      getWebsites()
    ]);
    if (s.success) setSales(s.data);
    if (p.success) setProducts(p.data);
    if (w.success) setWebsites(w.data);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => { loadAll(); }, [filterDate, filterWebsite, filterProduct]);

  const handleRefresh = () => { setRefreshing(true); loadAll(); };

  const handleDelete = async () => {
    setDeleting(true);
    await deleteSale(deleteTarget["Sale ID"]);
    setDeleting(false);
    setDeleteTarget(null);
    loadAll();
  };

  // Stats
  const totalRevenue    = sales.reduce((s, i) => s + (Number(i["Total Amount"]) || 0), 0);
  const totalOrders     = sales.length;
  const totalQuantity   = sales.reduce((s, i) => s + (Number(i["Quantity"]) || 0), 0);

  // By website
  const byWebsite = {};
  sales.forEach(s => {
    const w = s["Website"] || "Other";
    if (!byWebsite[w]) byWebsite[w] = { count: 0, amount: 0, qty: 0 };
    byWebsite[w].count++;
    byWebsite[w].amount += Number(s["Total Amount"]) || 0;
    byWebsite[w].qty    += Number(s["Quantity"]) || 0;
  });

  // By product
  const byProduct = {};
  sales.forEach(s => {
    const p = s["Product"] || "Other";
    if (!byProduct[p]) byProduct[p] = { count: 0, amount: 0, qty: 0 };
    byProduct[p].count++;
    byProduct[p].amount += Number(s["Total Amount"]) || 0;
    byProduct[p].qty    += Number(s["Quantity"]) || 0;
  });

  const isToday = filterDate === getTodayStr();

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Management</h1>
          <p className="text-sm text-gray-400">
            {isToday ? "Today" : filterDate} • {totalOrders} orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button onClick={() => setManageProducts(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:text-gray-800 text-sm px-3 py-2 rounded-lg transition-colors">
                <Package size={14} /> Products
              </button>
              <button onClick={() => setManageWebsites(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:text-gray-800 text-sm px-3 py-2 rounded-lg transition-colors">
                <Globe size={14} /> Websites
              </button>
            </>
          )}
          <button onClick={handleRefresh} disabled={refreshing}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-500 text-sm px-3 py-2 rounded-lg transition-colors">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          {canAdd && (
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus size={16} /> Add Sale
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          <input type="date"
            value={filterDate ? filterDate.split("/").reverse().join("-") : ""}
            onChange={e => {
              if (e.target.value) {
                const [y,m,d] = e.target.value.split("-");
                setFilterDate(`${d}/${m}/${y}`);
              } else setFilterDate("");
            }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>
        <select value={filterWebsite} onChange={e => setFilterWebsite(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
          <option value="">All Websites</option>
          {websites.filter(w => w["Status"] === "Active").map(w => (
            <option key={w["Website ID"]}>{w["Website Name"]}</option>
          ))}
        </select>
        <select value={filterProduct} onChange={e => setFilterProduct(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-white">
          <option value="">All Products</option>
          {products.filter(p => p["Status"] === "Active").map(p => (
            <option key={p["Product ID"]}>{p["Product Name"]}</option>
          ))}
        </select>
        {(filterWebsite || filterProduct) && (
          <button onClick={() => { setFilterWebsite(""); setFilterProduct(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
        )}
        <button onClick={() => setFilterDate(getTodayStr())}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${isToday ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
          Today
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Revenue</p>
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
            <p className="text-xs text-gray-400">Units Sold</p>
            <p className="text-2xl font-bold text-gray-800">{totalQuantity}</p>
          </div>
        </div>
      </div>

      {/* Website + Product Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* By Website */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Globe size={16} className="text-purple-500" />
            <p className="text-sm font-semibold text-gray-700">By Website</p>
          </div>
          {Object.keys(byWebsite).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No data</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byWebsite).sort((a,b) => b[1].amount - a[1].amount).map(([w, data]) => (
                <div key={w} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium min-w-[120px] text-center ${websiteColors[w] || "bg-gray-100 text-gray-600"}`}>{w}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full transition-all"
                      style={{ width: `${totalRevenue > 0 ? (data.amount/totalRevenue*100) : 0}%` }} />
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs font-bold text-gray-700">${data.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{data.qty} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Product */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-green-500" />
            <p className="text-sm font-semibold text-gray-700">By Product</p>
          </div>
          {Object.keys(byProduct).length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No data</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(byProduct).sort((a,b) => b[1].amount - a[1].amount).map(([p, data]) => (
                <div key={p} className="flex items-center gap-3">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium min-w-[60px] text-center">{p}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full transition-all"
                      style={{ width: `${totalRevenue > 0 ? (data.amount/totalRevenue*100) : 0}%` }} />
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-xs font-bold text-gray-700">${data.amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{data.qty} units</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Sales Log</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{sales.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm animate-pulse">Loading...</div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
            <ShoppingCart size={24} className="text-gray-300" />
            <p className="text-sm">No sales found</p>
            {canAdd && <button onClick={() => setAddOpen(true)} className="text-blue-500 text-xs hover:underline">Add first sale</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Website</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Unit Price</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Notes</th>
                  <th className="px-4 py-3 text-left">Added By</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  {(canEdit || canDelete) && <th className="px-4 py-3 text-left"></th>}
                </tr>
              </thead>
              <tbody>
                {sales.map((sale, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono">{sale["Sale ID"]}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${websiteColors[sale["Website"]] || "bg-gray-100 text-gray-600"}`}>
                        {sale["Website"] || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
                        {sale["Product"] || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-700">{sale["Quantity"]}</td>
                    <td className="px-4 py-3 text-gray-500">${Number(sale["Unit Price"]).toLocaleString()}</td>
                    <td className="px-4 py-3 text-green-600 font-bold">${Number(sale["Total Amount"]).toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-400 max-w-[120px] truncate">{sale["Notes"] || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                          {sale["Added By"]?.[0]}
                        </div>
                        <span className="text-gray-500">{sale["Added By"]}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{sale["Date"]}</td>
                    {(canEdit || canDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {canEdit && (
                            <button onClick={() => setEditTarget(sale)}
                              className="p-1.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                              <Edit3 size={13} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => setDeleteTarget(sale)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              {/* Total row */}
              <tfoot>
                <tr className="bg-gray-50 border-t-2 border-gray-200 font-semibold">
                  <td colSpan={3} className="px-4 py-3 text-xs text-gray-600">Total</td>
                  <td className="px-4 py-3 text-xs text-gray-700">{totalQuantity}</td>
                  <td className="px-4 py-3 text-xs text-gray-500"></td>
                  <td className="px-4 py-3 text-sm text-green-600 font-bold">${totalRevenue.toLocaleString()}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {canAdd && <AddSaleModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={loadAll} />}
      <EditSaleModal open={!!editTarget} sale={editTarget} onClose={() => setEditTarget(null)} onUpdated={loadAll} />
      <DeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        deleting={deleting}
        title="Delete Sale?"
        message={`Sale of "${deleteTarget?.["Product"]}" from ${deleteTarget?.["Website"]} will be deleted.`}
      />
      <ManageProductsModal
        open={manageProducts}
        onClose={() => setManageProducts(false)}
        products={products}
        onUpdated={loadAll}
      />
      <ManageWebsitesModal
        open={manageWebsites}
        onClose={() => setManageWebsites(false)}
        websites={websites}
        onUpdated={loadAll}
      />
    </div>
  );
}
