"use client";
import { X, Package, Hash, DollarSign, Calendar, Layers } from "lucide-react";
import { createProduct } from "@/lib/actions/inventory-actions";

export default function AddBatchModal({ isOpen, onClose, onRefresh }) {
  if (!isOpen) return null;

  async function handleSubmit(formData) {
    const res = await createProduct(formData);
    if (res.success) {
      onRefresh(); // Recarga la lista de productos
      onClose();   // Cierra el modal
    } else {
      alert("Error: " + res.error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        
        {/* Header del Modal */}
        <div className="p-6 border-b border-[var(--border)] bg-zinc-500/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-brand">Initialize New Batch</h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Neural Engine Inventory Protocol</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-500/10 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Formulario */}
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Batch SKU" name="sku" icon={<Hash size={14}/>} placeholder="NE-0001" defaultValue={`NE-${Date.now().toString().slice(-6)}`} required />
            <InputGroup label="Product Name" name="name" icon={<Package size={14}/>} placeholder="e.g. Neural Processor" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Category" name="category" icon={<Layers size={14}/>} placeholder="Hardware" />
            <InputGroup label="Unit Price" name="base_price" icon={<DollarSign size={14}/>} type="number" step="0.01" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Initial Stock" name="stock" type="number" placeholder="0" required />
            <InputGroup label="Min. Alert" name="min_stock" type="number" placeholder="5" defaultValue="5" />
          </div>

          <InputGroup label="Expiration Date" name="expiration_date" type="date" icon={<Calendar size={14}/>} />

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest border border-[var(--border)] rounded-xl hover:bg-zinc-500/5 transition-all"
            >
              Abort Mission
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest bg-brand text-white rounded-xl hover:bg-brand/90 shadow-lg shadow-brand/20 transition-all"
            >
              Commit to Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Sub-componente para inputs consistentes
function InputGroup({ label, name, icon, ...props }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight flex items-center gap-2">
        {icon} {label}
      </label>
      <input
        name={name}
        className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-zinc-600"
        {...props}
      />
    </div>
  );
}