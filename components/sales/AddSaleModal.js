"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { createSale, getProducts, getWebsites } from "@/lib/api";
import { X, ShoppingCart, Check } from "lucide-react";

export default function AddSaleModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    websites: [], product: "", quantity: 1,
    unitPrice: "", notes: ""
  });

  useEffect(() => {
    Promise.all([getProducts(), getWebsites()]).then(([p, w]) => {
      if (p.success) setProducts(p.data.filter(x => x["Status"] === "Active"));
      if (w.success) setWebsites(w.data.filter(x => x["Status"] === "Active"));
    });
  }, []);

  useEffect(() => {
    if (open) { setForm({ websites: [], product: "", quantity: 1, unitPrice: "", notes: "" }); setError(""); }
  }, [open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleWebsite = (name) => {
    setForm(f => ({
      ...f,
      websites: f.websites.includes(name)
        ? f.websites.filter(w => w !== name)
        : [...f.websites, name]
    }));
  };

  const selectAllWebsites = () => {
    const allNames = websites.map(w => w["Website Name"]);
    setForm(f => ({
      ...f,
      websites: f.websites.length === allNames.length ? [] : allNames
    }));
  };

  const handleProductChange = (productName) => {
    set("product", productName);
    const found = products.find(p => p["Product Name"] === productName);
    if (found) set("unitPrice", found["Price"]);
  };

  const total = Number(form.quantity || 0) * Number(form.unitPrice || 0);
  const grandTotal = total * form.websites.length;

  const handleSubmit = async () => {
    if (form.websites.length === 0 || !form.product || !form.quantity || !form.unitPrice) {
      setError("Select at least one website, product, quantity and price"); return;
    }
    setLoading(true); setError("");
    try {
      // Create one sale per website
      await Promise.all(form.websites.map(website =>
        createSale({
          website,
          product:   form.product,
          quantity:  form.quantity,
          unitPrice: form.unitPrice,
          notes:     form.notes,
          addedBy:   user?.fullName
        })
      ));
      onCreated?.(); onClose();
    } catch { setError("Something went wrong."); }
    setLoading(false);
  };

  if (!open) return null;

  const allSelected = form.websites.length === websites.length && websites.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={16} className="text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Add Sale</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{error}</div>}

          {/* Website — multi select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Website <span className="text-red-500">*</span>
                {form.websites.length > 0 && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {form.websites.length} selected
                  </span>
                )}
              </label>
              <button onClick={selectAllWebsites}
                className="text-xs text-blue-500 hover:text-blue-700 font-medium">
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {websites.map(w => {
                const selected = form.websites.includes(w["Website Name"]);
                return (
                  <button key={w["Website ID"]}
                    onClick={() => toggleWebsite(w["Website Name"])}
                    className={`relative px-3 py-2.5 rounded-xl text-xs font-medium border-2 transition-all ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}>
                    {selected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                    {w["Website Name"]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {products.map(p => (
                <button key={p["Product ID"]}
                  onClick={() => handleProductChange(p["Product Name"])}
                  className={`relative px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                    form.product === p["Product Name"]
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}>
                  {form.product === p["Product Name"] && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
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
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Per website</span>
                <span className="text-sm font-semibold text-gray-700">${total.toLocaleString()}</span>
              </div>
              {form.websites.length > 1 && (
                <div className="flex justify-between items-center border-t border-green-200 pt-2">
                  <span className="text-sm text-green-700 font-medium">
                    Grand Total ({form.websites.length} websites)
                  </span>
                  <span className="text-xl font-bold text-green-600">${grandTotal.toLocaleString()}</span>
                </div>
              )}
              {form.websites.length === 1 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700 font-medium">Total</span>
                  <span className="text-xl font-bold text-green-600">${total.toLocaleString()}</span>
                </div>
              )}
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

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={onClose} className="px-5 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-medium rounded-xl transition-colors">
            {loading ? "Saving..." : form.websites.length > 1 ? `Add ${form.websites.length} Sales` : "Add Sale"}
          </button>
        </div>
      </div>
    </div>
  );
}
