"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, AlertTriangle, Calendar, Package, MoreVertical, Sparkles, Edit, Trash2, Search, ChevronLeft, ChevronRight, DollarSign, Clock } from "lucide-react";
import { getBatches, getProducts, deleteBatch } from "@/lib/actions/inventory-actions";
import AddBatchModal from "@/components/inventory/AddBatchModal";
import { notify } from "@/components/ui/ToastAlert";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function BatchesPage() {
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batches, setBatches] = useState([]);
  const [productsForModal, setProductsForModal] = useState([]); // Para el modal de crear lote
  const [loading, setLoading] = useState(true);

  // ESTADOS para el buscador y paginación
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle delete request
  const handleDeleteRequest = (id) => {
    setBatchToDelete(id);
    setIsDeleteModalOpen(true);
  };
  // Cargar datos de lotes
  const loadData = useCallback(async () => {
    setLoading(true);
    console.log("buscando los lotes con search: ", search);
    const response = await getBatches(page, itemsPerPage, search);

    if (response.success) {
      setBatches(response.batches);
      setTotalPages(Math.ceil((response.totalCount || 0) / itemsPerPage));
    }
    setLoading(false);
  }, [page, search]);

  const handleConfirmDelete = async () => {
    if (!batchToDelete) return;

    setIsDeleting(true);
    const res = await deleteBatch(batchToDelete);

    if (res.success) {
      loadData(); // Recarga la tabla
      setIsDeleteModalOpen(false);
      // Alerta de éxito personalizada
      notify.success('PROTOCOL_EXECUTED', {
        description: 'El producto ha sido Eliminado con éxito.',
      });
    } else {
      // Alerta de éxito personalizada
      notify.error('SYSTEM_ERROR', {
        description: 'No se ha podido eliminar el producto, Intente de nuevo.' + res.error,
      });
    }
    setIsDeleting(false);
    setBatchToDelete(null);
  };

  // console.log("batches: ", batches);
  // Cargar productos para el modal (una sola vez)
  useEffect(() => {
    const fetchProducts = async () => {
      // Pedimos una lista grande o sin paginar para el select del modal
      // Nota: Idealmente deberíamos tener un endpoint de 'search' en el modal, 
      // pero por ahora traemos los primeros 100 o usamos la misma función.
      const res = await getProducts(1, 100);
      if (res.success) {

        const physicalOnly = res.products.filter(product => product.type === 'physical');
        setProductsForModal(physicalOnly);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);

    return () => clearTimeout(timer);
  }, [loadData]);


  const getRiskLevel = (batch) => {
    const today = new Date();
    const expDate = batch.expiration_date ? new Date(batch.expiration_date) : null;

    if (expDate && expDate < today)
      return { label: "EXPIRED", style: "border-red-600/50 text-red-600 bg-red-600/10" };

    const daysToExpire = expDate ? (expDate - today) / (1000 * 60 * 60 * 24) : 999;

    if (daysToExpire < 30)
      return { label: "NEAR EXPIRY", style: "border-orange-500/50 text-orange-500 bg-orange-500/10" };

    if (batch.stock === 0)
      return { label: "EMPTY", style: "border-zinc-500/50 text-zinc-500 bg-zinc-500/10" };

    return { label: "ACTIVE", style: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" };
  };

  const batchesAtRisk = batches.filter(b => {
    const risk = getRiskLevel(b);
    return risk.label === "EXPIRED" || risk.label === "NEAR EXPIRY";
  }).length;



  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Batch Management</h1>
          <p className="text-zinc-500 text-sm">Track expiry dates, costs, and specific product lots.</p>
        </div>
        <div className="flex w-full md:w-auto justify-end">
          <button
            className="w-full md:w-auto justify-center bg-brand text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
            onClick={() => {
              setIsBatchModalOpen(true);
            }}
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" /> Add New Batch
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Expiry Risk</p>
            <AlertTriangle className={batchesAtRisk > 0 ? "text-orange-500" : "text-zinc-500"} size={16} />
          </div>
          <p className="text-2xl font-black mt-1">{batchesAtRisk} <span className="text-xs font-normal text-zinc-500 italic">batches need attention</span></p>
        </div>

        {/* Placeholder KPIs */}
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Batches</p>
            <Package className="text-brand" size={16} />
          </div>
          <p className="text-2xl font-black mt-1">{batches.length} <span className="text-xs font-normal text-zinc-500 italic">active references</span></p>
        </div>
      </div>

      {/* TOOLS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 border border-[var(--border)] rounded-2xl mb-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand transition-colors" size={18} />
          <input
            type="text"
            placeholder="SEARCH BATCH OR PRODUCT..."
            className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-brand transition-all placeholder:text-zinc-600"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-zinc-500/5 p-1 rounded-lg border border-[var(--border)]">
            <button
              disabled={page === 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 hover:bg-brand/10 text-zinc-500 hover:text-brand disabled:opacity-20 disabled:hover:bg-transparent transition-all rounded-md"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="px-3">
              <span className="text-[10px] font-black font-mono">
                PAGE {page} <span className="text-zinc-500">/</span> {totalPages}
              </span>
            </div>
            <button
              disabled={page === totalPages || loading}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 hover:bg-brand/10 text-zinc-500 hover:text-brand disabled:opacity-20 disabled:hover:bg-transparent transition-all rounded-md"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-500/5 border-b border-[var(--border)] text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              <tr>
                <th className="p-4">Batch Number</th>
                <th className="p-4">Product</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Cost / Unit</th>
                <th className="p-4">Received / Expiry</th>
                <th className="p-4 text-right">Status</th>
                <th className="p-4 text-center">Actions</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="p-8">
                      <div className="h-4 bg-zinc-500/10 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : batches.length > 0 ? (
                batches.map((batch) => {
                  const risk = getRiskLevel(batch);
                  return (
                    <tr key={batch.id} className="hover:bg-brand/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-500/5 rounded-lg group-hover:bg-brand/10 transition-colors">
                            <Package size={16} className="text-zinc-500 group-hover:text-brand" />
                          </div>
                          <div>
                            <p className="font-bold text-[var(--foreground)] uppercase tracking-tight">{batch.batch_number}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">ID: {batch.id && batch.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-[var(--foreground)] uppercase tracking-tight">{batch.product_name || "Unknown Product"}</p>
                      </td>
                      <td className="p-4 font-black">
                        {batch.stock} <span className="text-[10px] font-normal text-zinc-500">units</span>
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-zinc-500">
                        {parseFloat(batch.cost_per_unit || 0).toFixed(2)}€
                      </td>
                      <td className="p-4 text-[10px] font-mono text-zinc-400">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <Clock size={12} className="text-zinc-600" />
                            <span>IN: {batch.received_at ? new Date(batch.received_at).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className={risk.label === "EXPIRED" ? "text-red-500" : "text-zinc-600"} />
                            <span>EXP: {batch.expiration_date ? new Date(batch.expiration_date).toLocaleDateString() : 'NO_EXPIRY'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${risk.style}`}>
                          {risk.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleDeleteRequest(batch.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Terminate Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search size={40} className="text-zinc-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Batches Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* FOOTER INFO */}
        {!loading && batches.length > 0 && (
          <div className="p-4 bg-zinc-500/5 border-t border-[var(--border)] flex justify-between items-center">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              Showing {batches.length} batches
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest italic">
              UnitySales v1.0
            </p>
          </div>
        )}
      </div>

      <AddBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          loadData(); // Recargar datos al cerrar modal (por si se creó uno)
        }}
        products={productsForModal}
      />
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Batch"
        message={`¿Estás seguro de que deseas eliminar el registro del sistema? Esta acción es irreversible.`}
      />
    </div>
  );
}