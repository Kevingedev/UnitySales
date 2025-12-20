"use client";
import { useState, useEffect } from "react";
import { Plus, AlertTriangle, Calendar, Package, MoreVertical, Sparkles } from "lucide-react";
import { getInventory } from "@/lib/actions/inventory-actions";

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const response = await getInventory();
      if (response.success) setProducts(response.products);
      setLoading(false);
    }
    loadData();
  }, []);

  // Lógica de Riesgo basada en Stock
  const getRiskLevel = (stock, minStock) => {
    if (stock === 0) return { label: "CRITICAL LOSS", style: "border-red-500/50 text-red-500 bg-red-500/10" };
    if (stock <= minStock) return { label: "REPLENISH", style: "border-amber-500/50 text-amber-500 bg-amber-500/10" };
    return { label: "OPTIMAL", style: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" };
  };

  const lossRiskCount = products.filter(p => p.stock <= (p.min_stock || 5)).length;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Stock & Batch Control</h1>
          <p className="text-zinc-500 text-sm">Traceability and loss prevention monitoring.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20">
          <Plus size={18} /> Add New Batch
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Loss Risk</p>
            <AlertTriangle className={`text-${lossRiskCount > 0 ? 'red-500' : 'zinc-500'}`} size={16} />
          </div>
          <p className="text-2xl font-black mt-1">
            {lossRiskCount} <span className="text-xs font-normal text-zinc-500 italic lowercase">items at risk</span>
          </p>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl border-brand/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={40} className="text-brand" />
          </div>
          <p className="text-brand text-[10px] font-bold uppercase tracking-widest">AI Suggestion</p>
          <p className="text-sm font-medium mt-1">
            {lossRiskCount > 0 
              ? `Restock required for ${products.find(p => p.stock <= p.min_stock)?.name || 'various items'}`
              : "Inventory levels are stable. No actions required."}
          </p>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-500/5 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="p-4">Product / Batch</th>
              <th className="p-4">Category</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Unit Price</th>
              <th className="p-4 text-right">Risk Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-sm">
            {loading ? (
              <tr><td colSpan="5" className="p-10 text-center text-zinc-500 animate-pulse font-mono uppercase text-[10px]">Accessing encrypted database...</td></tr>
            ) : products.map((item) => {
              const risk = getRiskLevel(item.stock, item.min_stock || 5);
              return (
                <tr key={item.id} className="hover:bg-brand/5 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 bg-zinc-500/5 rounded-lg group-hover:bg-brand/10 transition-colors">
                          <Package size={16} className="text-zinc-500 group-hover:text-brand" />
                       </div>
                       <div>
                        <p className="font-bold text-[var(--foreground)] uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">ID: {item.sku}</p>
                       </div>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-500 italic">{item.category || "General"}</td>
                  <td className="p-4 font-black">
                    {item.stock} <span className="text-[10px] font-normal text-zinc-500">units</span>
                  </td>
                  <td className="p-4 font-mono text-xs font-bold">
                    ${parseFloat(item.base_price).toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${risk.style} transition-all`}>
                      {risk.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}