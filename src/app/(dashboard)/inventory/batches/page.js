"use client";
import { useState, useEffect, useCallback } from "react"; // 1. Añadimos useCallback
import { Plus, AlertTriangle, Calendar, Package, MoreVertical, Sparkles, Edit, Trash2 } from "lucide-react";
import { getInventory, deleteProduct } from "@/lib/actions/inventory-actions";
import AddProductModal from "@/components/inventory/AddProductModal";
import AddBatchModal from "@/components/inventory/AddBatchModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { notify } from "@/components/ui/ToastAlert";

export default function InventoryPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);

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
    // No ponemos loading(true) aquí para evitar parpadeos en updates
    const response = await getInventory();
    if (response.success) {
      setProducts(response.products);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]); // Dependencia limpia

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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Stock & Batch Control</h1>
          <p className="text-zinc-500 text-sm">Traceability and loss prevention monitoring.</p>
        </div>
        <div className="flex justify-between items-end gap-2">
          <button
            className="bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={18} /> Add New Product
          </button>
          <button
            className="bg-brand text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-brand/90 transition-all shadow-lg shadow-brand/20"
            onClick={() => {
              setIsBatchModalOpen(true);
            }}
          >
            <Plus size={18} /> Add New Batch
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

      {/* DATA TABLE */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
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
              <tr><td colSpan="7" className="p-10 text-center text-zinc-500 animate-pulse font-mono uppercase text-[10px]">Accessing encrypted database...</td></tr>
            ) : (
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
                          <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">ID: {item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-500 italic">{item.categories?.name || "General"}</td>
                    <td className="p-4 font-black">{item.stock} <span className="text-[10px] font-normal text-zinc-500">units</span></td>
                    <td className="p-4 font-mono text-xs font-bold">${parseFloat(item.base_price).toFixed(2)}</td>
                    <td className="p-4 text-xs font-mono text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-1.5 text-brand hover:bg-brand/10 rounded-lg transition-colors"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteRequest(item.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${risk.style}`}>{risk.label}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onRefresh={loadData}
        productToEdit={editingProduct}
      />
      <AddBatchModal 
        isOpen={isBatchModalOpen} 
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