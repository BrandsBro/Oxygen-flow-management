"use client";
import { useState } from "react";
import { createProduct, updateProduct } from "@/lib/api";
import { X, Plus, Save, Package } from "lucide-react";

export default function ManageProductsModal({ open, onClose, products, onUpdated }) {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [adding, setAdding] = useState(false);
  const [editPrices, setEditPrices] = useState({});
  const [saving, setSaving] = useState({});

  const handleAdd = async () => {
    if (!newName || !newPrice) return;
    setAdding(true);
    await createProduct({ name: newName, price: newPrice });
    setNewName(""); setNewPrice("");
    onUpdated?.();
    setAdding(false);
  };

  const handleUpdatePrice = async (id, price) => {
    setSaving(s => ({ ...s, [id]: true }));
    await updateProduct({ id, price });
    onUpdated?.();
    setSaving(s => ({ ...s, [id]: false }));
  };

  const handleToggleStatus = async (id, currentStatus) => {
    await updateProduct({ id, status: currentStatus === "Active" ? "Inactive" : "Active" });
    onUpdated?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-green-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Manage Products</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Existing Products */}
          <div className="space-y-2">
            {products.map(p => (
              <div key={p["Product ID"]} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{p["Product Name"]}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p["Status"] === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p["Status"]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">$</span>
                  <input
                    type="number"
                    defaultValue={p["Price"]}
                    onChange={e => setEditPrices(ep => ({ ...ep, [p["Product ID"]]: e.target.value }))}
                    className="w-20 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-blue-400 text-center"
                  />
                  <button
                    onClick={() => handleUpdatePrice(p["Product ID"], editPrices[p["Product ID"]] || p["Price"])}
                    disabled={saving[p["Product ID"]]}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors">
                    <Save size={12} />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(p["Product ID"], p["Status"])}
                    className={`p-1.5 rounded-lg transition-colors text-xs font-medium ${
                      p["Status"] === "Active" ? "bg-red-100 text-red-600 hover:bg-red-200" : "bg-green-100 text-green-600 hover:bg-green-200"
                    }`}>
                    {p["Status"] === "Active" ? "Off" : "On"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New */}
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Add New Product</p>
            <div className="flex gap-2">
              <input type="text" value={newName} onChange={e => setNewName(e.target.value)}
                placeholder="Product name" className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <input type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)}
                placeholder="Price" className="w-24 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              <button onClick={handleAdd} disabled={adding || !newName || !newPrice}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-500 disabled:bg-green-300 text-white text-sm px-3 py-2 rounded-xl transition-colors">
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
