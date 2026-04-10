"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getInvoices, deleteInvoice } from "@/lib/api";
import AddInvoiceModal from "@/components/invoices/AddInvoiceModal";
import InvoiceCard from "@/components/invoices/InvoiceCard";
import InvoiceTable from "@/components/invoices/InvoiceTable";
import { LayoutGrid, List, FileText, TrendingUp, Calendar } from "lucide-react";

export default function InvoicesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState("cards");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    if (user && user.role !== "Admin") router.push("/dashboard");
  }, [user]);

  async function load() {
    const res = await getInvoices();
    if (res.success) setInvoices(res.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this invoice?")) return;
    await deleteInvoice(id);
    await load();
  };

  const months = [...new Set(invoices.map(i => i["Month"]).filter(Boolean))];
  const years  = [...new Set(invoices.map(i => String(i["Year"])).filter(Boolean))];

  const filtered = invoices.filter(i => {
    const matchMonth = !filterMonth || i["Month"] === filterMonth;
    const matchYear  = !filterYear  || String(i["Year"]) === filterYear;
    return matchMonth && matchYear;
  });

  const grouped = {};
  filtered.forEach(inv => {
    const key = `${inv["Month"]} ${inv["Year"]}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(inv);
  });

  const sortedGroups = Object.entries(grouped).sort((a, b) => {
    return new Date(`${b[0]} 1`) - new Date(`${a[0]} 1`);
  });

  const totalAmount     = filtered.reduce((s, i) => s + (Number(i["Amount"]) || 0), 0);
  const thisMonth       = new Date().toLocaleString("en-US", { month: "long" });
  const thisYear        = String(new Date().getFullYear());
  const thisMonthTotal  = invoices
    .filter(i => i["Month"] === thisMonth && String(i["Year"]) === thisYear)
    .reduce((s, i) => s + (Number(i["Amount"]) || 0), 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-sm text-gray-400">{filtered.length} invoices</p>
        </div>
        <button onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Add Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-blue-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Invoices</p>
            <p className="text-2xl font-bold text-gray-800">{filtered.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-green-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Total Amount</p>
            <p className="text-2xl font-bold text-gray-800">${totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border-l-4 border-purple-400 flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Calendar size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-gray-800">${thisMonthTotal.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Filters + View Toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
          <option value="">All Months</option>
          {months.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 bg-white">
          <option value="">All Years</option>
          {years.map(y => <option key={y}>{y}</option>)}
        </select>
        {(filterMonth || filterYear) && (
          <button onClick={() => { setFilterMonth(""); setFilterYear(""); }}
            className="text-xs text-gray-400 hover:text-gray-600 underline">Clear</button>
        )}
        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView("cards")}
            className={`p-1.5 rounded-md transition-colors ${view === "cards" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setView("table")}
            className={`p-1.5 rounded-md transition-colors ${view === "table" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-400 animate-pulse text-sm">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
          <FileText size={24} className="text-gray-300" />
          <p className="text-sm">No invoices found</p>
        </div>
      ) : view === "cards" ? (
        <div className="space-y-6">
          {sortedGroups.map(([monthYear, invs]) => (
            <div key={monthYear}>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{monthYear}</h3>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">{invs.length} invoice{invs.length > 1 ? "s" : ""}</span>
                <span className="text-xs font-semibold text-green-600">
                  ${invs.reduce((s, i) => s + (Number(i["Amount"]) || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {invs.map(inv => <InvoiceCard key={inv["Invoice ID"]} invoice={inv} onDelete={handleDelete} />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <InvoiceTable invoices={filtered} onDelete={handleDelete} />
      )}

      <AddInvoiceModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={() => load()} />
    </div>
  );
}
