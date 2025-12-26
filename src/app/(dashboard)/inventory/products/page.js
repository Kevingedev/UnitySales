"use client";
import { useState, useEffect, useCallback } from "react"; // 1. Añadimos useCallback
import { Plus, AlertTriangle, Calendar, Package, MoreVertical, Sparkles, Edit, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getProducts, deleteProduct } from "@/lib/actions/inventory-actions";
import AddProductModal from "@/components/inventory/AddProductModal";
import AddBatchModal from "@/components/inventory/AddBatchModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { notify } from "@/components/ui/ToastAlert";
import { toast } from "sonner";

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

  //ESTADOS para el buscador 
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Puedes cambiar este número

  //ESTADOS para el dialogo de Delete
  // 1. Añade estos estados
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 2. Nueva función para abrir el modal
  const handleDeleteRequest = (id) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // 3. Función que ejecuta la eliminación real
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    const res = await deleteProduct(productToDelete);

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
        description: 'No se ha podido eliminar el producto, Intente de nuevo.',
      });
    }
    setIsDeleting(false);
    setProductToDelete(null);
  };

  // 2. Memorizamos loadData para que React no crea que cambia en cada render
  const loadData = useCallback(async () => {
    setLoading(true);
    // Pasamos page, itemsPerPage y search a la acción del servidor
    const response = await getProducts(page, itemsPerPage, search);

    if (response.success) {
      setProducts(response.products);
      // Calculamos el total de páginas basándonos en el count real de la DB
      setTotalPages(Math.ceil((response.totalCount || 0) / itemsPerPage));
    }
    setLoading(false);
  }, [page, search]); // Se vuelve a ejecutar si cambia la página o la búsqueda

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400); // Espera 400ms después de que dejas de escribir

    return () => clearTimeout(timer);
  }, [loadData]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    // Optimistic update
    const previousProducts = [...products];
    setProducts(products.filter(p => p.id !== id));

    const res = await deleteProduct(id);
    if (!res.success) {
      alert("Error deleting product");
      setProducts(previousProducts); // Revertir con el backup
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // ... (tu lógica de getRiskLevel se queda igual, está perfecta)
  const getRiskLevel = (stock, minStock, expirationDate) => {
    const today = new Date();
    const expDate = expirationDate ? new Date(expirationDate) : null;
    if (expDate && expDate < today) return { label: "EXPIRED", style: "border-red-600/50 text-red-600 bg-red-600/10" };
    const daysToExpire = expDate ? (expDate - today) / (1000 * 60 * 60 * 24) : 999;
    if (daysToExpire < 30) return { label: "NEAR EXPIRY", style: "border-orange-500/50 text-orange-500 bg-orange-500/10" };
    if (stock === 0) return { label: "OUT OF STOCK", style: "border-red-500/50 text-red-500 bg-red-500/10" };
    if (stock <= minStock) return { label: "LOW STOCK", style: "border-amber-500/50 text-amber-500 bg-amber-500/10" };
    return { label: "OPTIMAL", style: "border-emerald-500/50 text-emerald-500 bg-emerald-500/10" };
  };

  const lossRiskCount = products.filter(p => p.stock <= (p.min_stock || 5)).length;

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Products Management</h1>
          <p className="text-zinc-500 text-sm">Traceability and loss prevention monitoring.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <button
            className="w-full md:w-auto justify-center bg-brand text-white px-3 py-2 md:px-4 md:py-2 rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" /> Add New Product
          </button>
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

      {/* KPI GRID (Tu código igual...) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Loss Risk</p>
            <AlertTriangle className={lossRiskCount > 0 ? "text-red-500" : "text-zinc-500"} size={16} />
          </div>
          <p className="text-2xl font-black mt-1">{lossRiskCount} <span className="text-xs font-normal text-zinc-500 italic">items at risk</span></p>
        </div>
        {/* Agrega aquí el resto de tus KPIs */}
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

      {/* TOOLS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--card)] p-4 border border-[var(--border)] rounded-2xl mb-4">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-brand transition-colors" size={18} />
          <input
            type="text"
            placeholder="SEARCH PRODUCT OR SKU..."
            className="w-full bg-zinc-500/5 border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-xs font-bold uppercase outline-none focus:ring-1 focus:ring-brand transition-all placeholder:text-zinc-600"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reiniciar a página 1 al buscar
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
                <th className="p-4">Product / Batch</th>
                <th className="p-4">Category</th>
                <th className="p-4">On Hand</th>
                <th className="p-4">Unit Price</th>
                <th className="p-4">Expiration Date</th>
                <th className="p-4 text-center">Actions</th>
                <th className="p-4 text-right">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-sm">
              {loading ? (
                // SKELETON LOADING
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="p-8">
                      <div className="h-4 bg-zinc-500/10 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : products.length > 0 ? (
                products.map((item) => {
                  const risk = getRiskLevel(item.stock, item.min_stock || 5, item.expiration_date);
                  return (
                    <tr key={item.id} className="hover:bg-brand/5 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-500/5 rounded-lg group-hover:bg-brand/10 transition-colors">
                            <Package size={16} className="text-zinc-500 group-hover:text-brand" />
                          </div>
                          <div>
                            <p className="font-bold text-[var(--foreground)] uppercase tracking-tight">{item.name}</p>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">SKU: {item.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-zinc-500 italic text-xs">{item.categories?.name || "General"}</td>
                      <td className="p-4 font-black">
                        {item.stock} <span className="text-[10px] font-normal text-zinc-500">units</span>
                      </td>
                      <td className="p-4 font-mono text-xs font-bold text-brand">
                        ${parseFloat(item.base_price || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-[10px] font-mono text-zinc-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-zinc-600" />
                          {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : 'NO_EXPIRY'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-zinc-500 hover:text-brand hover:bg-brand/10 rounded-xl transition-all"
                            title="Edit Protocol"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(item.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Terminate Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${risk.style}`}>
                          {risk.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <Search size={40} className="text-zinc-500" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Data Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER INFO */}
        {!loading && products.length > 0 && (
          <div className="p-4 bg-zinc-500/5 border-t border-[var(--border)] flex justify-between items-center">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
              Showing {products.length} units in current buffer
            </p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest italic">
              UnitySales v1.0
            </p>
          </div>
        )}
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRefresh={loadData}
        productToEdit={editingProduct}
      />
      <AddBatchModal
        isOpen={isBatchModalOpen}
        onRefresh={loadData}
        onClose={() => setIsBatchModalOpen(false)}
        products={products}
      />
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        loading={isDeleting}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`¿Estás seguro de que deseas eliminar el registro del sistema? Esta acción es irreversible.`}
      />
    </div>
  );
} 