import React, { useState, useMemo } from 'react';
import { Package, Hash, Calendar, DollarSign, Search, X, CheckCircle2 } from 'lucide-react';
import { notify } from '@/components/ui/ToastAlert';
import { createBatch } from '@/lib/actions/inventory-actions';

export default function AddBatchModal({ isOpen, onClose, products = [] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // 1. Lógica de filtrado: Solo devuelve resultados si hay al menos 1 carácter escrito
  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term.length === 0 || selectedProduct) return [];

    return products.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term)
    ).slice(0, 5);
  }, [searchTerm, products, selectedProduct]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!selectedProduct) {
      notify.error("REQUIRED_FIELD", "Debe vincular un producto del catálogo.");
      return;
    }

    // Aquí procesas el formData y llamas a tu Server Action

    const result = await createBatch(formData);

    if (result.success) {
      notify.success("PROTOCOL_EXECUTED", "Lote registrado exitosamente.");
      onClose();
    } else {
      notify.error("PROTOCOL_EXECUTION_FAILED", "Error al registrar lote.");
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden neural-scan-effect animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-zinc-500/5">
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--foreground)] flex items-center gap-2">
              <Package size={14} className="text-brand" />
              Register Batch
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-500/10 rounded-lg text-zinc-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest ml-1">
              Target Product
            </label>

            <div className="relative">
              {selectedProduct ? (
                <div className="flex items-center justify-between bg-brand/10 border border-brand/30 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="text-brand" size={18} />
                    <div>
                      <p className="text-xs font-bold text-[var(--foreground)] uppercase">{selectedProduct.name}</p>
                      <p className="text-[10px] font-mono text-brand/70">{selectedProduct.sku}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedProduct(null); setSearchTerm(''); }}
                    className="text-[10px] font-black text-brand hover:text-brand/80 uppercase tracking-widest bg-brand/10 px-3 py-1.5 rounded-md border border-brand/20 transition-all"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand transition-colors" size={16} />
                    <input
                      type="text"
                      autoComplete="off"
                      placeholder="Type product name or SKU..."
                      className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:ring-1 focus:ring-brand focus:border-brand outline-none transition-all placeholder:text-zinc-600"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Resultados: Solo aparecen si hay texto en searchTerm */}
                  {searchTerm.trim().length > 0 && filteredProducts.length > 0 && (
                    <div className="absolute w-full mt-2 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl bg-opacity-95 animate-in fade-in slide-in-from-top-1 duration-200">
                      {filteredProducts.map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          className="w-full p-3 border-b border-[var(--border)] last:border-0 hover:bg-brand/10 flex justify-between items-center transition-colors group text-left"
                        >
                          <div>
                            <p className="text-xs font-bold text-[var(--foreground)] group-hover:text-brand">{p.name}</p>
                            <p className="text-[9px] font-mono text-zinc-500 uppercase">{p.sku}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 size={14} className="text-brand" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Estado "Sin resultados" (Opcional) */}
                  {searchTerm.trim().length > 0 && filteredProducts.length === 0 && (
                    <div className="absolute w-full mt-2 bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl shadow-2xl z-50 text-center animate-in fade-in duration-200">
                      <p className="text-[10px] font-mono text-zinc-500 uppercase">No_matches_found_in_database</p>
                    </div>
                  )}
                </>
              )}
            </div>
            <input type="hidden" name="product_id" value={selectedProduct?.id || ''} />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Hash size={12} className="text-brand" /> Batch Identifier
              </label>
              <input
                name="batch_number"
                required
                placeholder="Ex: BT-9920"
                className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-mono uppercase text-[var(--foreground)] focus:ring-1 focus:ring-brand outline-none transition-all"
                defaultValue={`BN-P-${Date.now().toString().slice(-6)}`}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Package size={12} className="text-brand" /> Stock Units
              </label>
              <input
                type="number"
                name="stock"
                required
                className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:ring-1 focus:ring-brand outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <DollarSign size={12} className="text-brand" /> Cost per Unit
              </label>
              <input
                type="number"
                step="0.01"
                name="cost_per_unit"
                className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-mono text-[var(--foreground)] focus:ring-1 focus:ring-brand outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                <Calendar size={12} className="text-brand" /> Expiration Date
              </label>
              <input
                type="date"
                name="expiration_date"
                className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl px-4 py-2 text-sm text-[var(--foreground)] focus:ring-1 focus:ring-brand outline-none [color-scheme:dark] transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!selectedProduct}
            className="w-full bg-brand disabled:opacity-40 disabled:grayscale hover:bg-brand/90 text-white font-black uppercase py-4 rounded-xl transition-all text-[10px] tracking-[0.3em] mt-4 active:scale-[0.98] shadow-lg shadow-brand/10"
          >
            Execute Registration Sequence
          </button>
        </form>
      </div>
    </div>
  );
}