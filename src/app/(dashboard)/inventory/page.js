"use client";
import { useState } from "react";
import { Package, Calendar, AlertTriangle, Plus } from "lucide-react";

// Mock data using English naming convention
const INVENTORY_ITEMS = [
  { 
    id: "prod_01", 
    name: "Whole Milk 1L", 
    category: "Dairy", 
    batchId: "L2405-A", 
    stock: 45, 
    expirationDate: "2025-01-10", 
    basePrice: 1.20 
  },
  { 
    id: "prod_02", 
    name: "Sliced Bread", 
    category: "Bakery", 
    batchId: "L2405-B", 
    stock: 12, 
    expirationDate: "2024-12-24", 
    basePrice: 2.50 
  },
];

export default function InventoryPage() {
  const getRiskLevel = (date) => {
    const today = new Date();
    const expiry = new Date(date);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 7) return { style: "bg-red-500/10 text-red-500 border-red-500/20", label: "Critical Expiry" };
    if (daysUntilExpiry <= 20) return { style: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Upcoming Expiry" };
    return { style: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Safe" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Stock & Batch Control</h1>
          <p className="text-zinc-500 text-sm">Traceability and loss prevention monitoring.</p>
        </div>
        <button className="bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand-hover transition-all shadow-lg shadow-brand/20">
          <Plus size={18} /> Add New Batch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Loss Risk</p>
            <AlertTriangle className="text-red-500" size={16} />
          </div>
          <p className="text-2xl font-black mt-1">2 <span className="text-xs font-normal text-zinc-500 italic lowercase">batches</span></p>
        </div>
        
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl border-brand/30">
          <p className="text-brand text-[10px] font-bold uppercase tracking-widest">AI Suggestion</p>
          <p className="text-sm font-medium mt-1">Restock 20 units of Bakery L2405-B</p>
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--aside)] border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <tr>
              <th className="p-4">Product / Batch</th>
              <th className="p-4">Category</th>
              <th className="p-4">On Hand</th>
              <th className="p-4">Expiration</th>
              <th className="p-4 text-right">Risk Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-sm">
            {INVENTORY_ITEMS.map((item) => {
              const risk = getRiskLevel(item.expirationDate);
              return (
                <tr key={item.id} className="hover:bg-brand/5 transition-colors group">
                  <td className="p-4">
                    <p className="font-bold text-[var(--foreground)]">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">{item.batchId}</p>
                  </td>
                  <td className="p-4 text-zinc-500">{item.category}</td>
                  <td className="p-4 font-black">{item.stock} <span className="text-[10px] font-normal text-zinc-500">units</span></td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <Calendar size={14} className="text-zinc-500" />
                      {item.expirationDate}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${risk.style}`}>
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