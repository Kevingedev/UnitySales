"use client";
import { Settings2, Tool, X, Package, Hash, DollarSign, Calendar, Tag, Percent } from "lucide-react";
import { createProduct, updateProduct } from "@/lib/actions/inventory-actions";
import NeuralSelect from "@/components/inventory/NeutralSelect";
import { useState } from "react";
import { notify } from "@/components/ui/ToastAlert";
export default function AddBatchModal({ isOpen, onClose, onRefresh, productToEdit = null }) {
  if (!isOpen) return null;

  const isEditing = !!productToEdit;
  const toastMessage = isEditing ? "El producto ha sido Actualizado con éxito." : "El producto ha sido Creado con éxito.";

  async function handleSubmit(formData) {
    let res;
    if (isEditing) {
      formData.append("id", productToEdit.id);
      res = await updateProduct(formData);
    } else {
      res = await createProduct(formData);
    }

    if (res.success) {
      onRefresh(); // Recarga la lista de productos
      onClose();   // Cierra el modal
      notify.success('PROTOCOL_EXECUTED', {
        description: toastMessage,
      });
    } else {
      notify.error('PROTOCOL_EXECUTED', {
        description: "Error: " + res.error,
      });
    }
  }

  // 2. Estado para el valor (inicializado con el del producto si estamos editando)
  const [selectedCat, setSelectedCat] = useState(productToEdit?.category_id || "");
  const [productType, setProductType] = useState(productToEdit?.type || "physical");


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 ">
      <div className="bg-[var(--card)] border border-[var(--border)] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">

        {/* Header del Modal */}
        <div className="p-6 border-b border-[var(--border)] bg-zinc-500/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter text-brand">
              {isEditing ? "Update Register" : "Initialize New Register"}
            </h2>
            <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Protocol: {productType === 'physical' ? 'MATERIAL ASSET' : 'INTANGIBLE SERVICE'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-500/10 rounded-full transition-colors">
            <X size={20} className="text-zinc-500" />
          </button>
        </div>

        {/* Formulario */}
        <form action={handleSubmit} className="p-6 space-y-4">

          {/* SELECTOR DE TIPO (NUEVO) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Entity Type Selection</label>
            <div className="flex p-1 bg-zinc-500/5 rounded-xl border border-[var(--border)]">
              <button
                type="button"
                onClick={() => setProductType('physical')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${productType === 'physical' ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 opacity-50'
                  }`}
              >
                <Package size={14} /> PRODUCT
              </button>
              <button
                type="button"
                onClick={() => setProductType('service')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black transition-all ${productType === 'service' ? 'bg-brand text-white shadow-lg' : 'text-zinc-500 opacity-50'
                  }`}
              >
                <Settings2 size={14} /> SERVICE
              </button>
            </div>
            <input type="hidden" name="type" value={productType} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label="Entity SKU (fixed)"
              name="sku"
              icon={<Hash size={14} />}
              placeholder="NE-0001"
              defaultValue={productToEdit?.sku || `NE-${Date.now().toString().slice(-6)}`}
              required
              readOnly
            />
            <InputGroup
              label={productType === 'physical' ? "Product Name" : "Service Name"}
              name="name"
              icon={productType === 'physical' ? <Package size={14} /> : <Settings2 size={14} />}
              placeholder={productType === 'physical' ? "e.g. Neural Processor" : "e.g. System Repair"}
              defaultValue={productToEdit?.name}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            <NeuralSelect value={selectedCat} onChange={setSelectedCat} />
            <input type="hidden" name="category" value={selectedCat} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup
              label={productType === 'physical' ? "Price (excl. tax)" : "Rate (excl. tax)"}
              name="base_price"
              icon={<DollarSign size={14} />}
              type="number"
              step="0.01"
              defaultValue={productToEdit?.base_price}
              required
            />
            <InputGroup
              label="Tax Rate (%)"
              name="tax_rate"
              icon={<Percent size={14} />}
              type="number"
              step="0.01"
              placeholder="16.00"
              defaultValue={productToEdit?.tax_rate || 0}
              required
            />
          </div>

          {/* CAMPOS DINÁMICOS BASADOS EN EL TIPO */}
          <div className={`grid grid-cols-2 gap-4 transition-all ${productType === 'service' ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
            <InputGroup
              label="Standard Cost"
              name="cost_price"
              icon={<Tag size={14} />}
              placeholder="0.00"
              type="number"
              step="0.01"
              defaultValue={productType === 'service' ? "0" : productToEdit?.cost_price}
              required={productType === 'physical'}
            />
            <InputGroup
              label="Min. Stock Alert"
              name="min_stock"
              type="number"
              placeholder={productType === 'service' ? "0" : (productToEdit?.min_stock || "0")}
              // defaultValue=
              required={productType === 'physical'}
            />
          </div>

          {/* Campo de Stock siempre deshabilitado, pero oculto visualmente si es servicio para limpiar la UI */}
          {productType === 'physical' && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <InputGroup
                label="Initial Stock (ReadOnly)"
                name="stock"
                type="number"
                placeholder="0"
                defaultValue={productToEdit?.stock || 0}
                required
                readOnly
              />
            </div>
          )}

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
              {isEditing ? "Update Protocol" : "Commit to Database"}
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
