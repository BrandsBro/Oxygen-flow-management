"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSale, getProducts, getWebsites } from "@/lib/api";
import { X, ShoppingCart } from "lucide-react";

export default function AddSaleModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    website: "", product: "", quantity: 1,
    unitPrice: "", notes: ""
  });

  useEffect(() => {
    Promise.all([getProducts(), getWebsites()]).then(([p, w]) => {
      if (p.success) setProducts(p.data.filter(x => x["Status"] === "Active"));
      if (w.success) setWebsites(w.data.filter(x => x["Status"] === "Active"));
    });
  }, []);

  useEffect(() => {
    if (open) setForm({ website: "", product: "", quantity: 1, unitPrice: "", notes: "" });
    setError("");
  }, [open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Auto fill price when product changes
  const handleProductChange = (productName) => {
    set("product", productName);
    const found = products.find(p => p["Product Name"] === productName);
    if (found) set("unitPrice", found["Price"]);
  };

  const total = Number(form.quantity || 0) * Number(form.unitPrice || 0);

  const handleSubmit = async () => {
    if (!form.website || !form.product || !form.quantity || !form.unitPrice) {
      setError("Website, Product, Quantity and Price are required"); return;
    }
    setLoading(true); setError("");
    try {
      const res = await createSale({ ...form, addedBy: user?.fullName });
      if (res.success) { onCreated?.(); onClose(); }
      else setError("Failed to add sale.");
    } catch { setError("Something went wrong."); }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Add Sale</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Website <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              {websites.map(w => (
                <button key={w["Website ID"]}
                  onClick={() => set("website", w["Website Name"])}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                    form.website === w["Website Name"]
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {w["Website Name"]}
                </button>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 gap-2">
              {products.map(p => (
                <button key={p["Product ID"]}
                  onClick={() => handleProductChange(p["Product Name"])}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    form.product === p["Product Name"]
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  <p className="font-bold">{p["Product Name"]}</p>
                  <p className="text-xs mt-0.5 opacity-70">${Number(p["Price"]).toLocaleString()}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity <span className="text-red-500">*</span></label>
              <input type="number" min="1" value={form.quantity}
                onChange={e => set("quantity", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 text-center font-bold text-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit Price <span className="text-red-500">*</span></label>
              <input type="number" value={form.unitPrice}
                onChange={e => set("unitPrice", e.target.value)}
                placeholder="0.00"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>

          {/* Total Preview */}
          {total > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-green-700 font-medium">Total Amount</span>
              <span className="text-xl font-bold text-green-600">${total.toLocaleString()}</span>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="Any notes..." rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none" />
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors">
            {loading ? "Saving..." : "Add Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
