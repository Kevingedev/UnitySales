"use client";
import { useEffect } from "react";
import { X, Calendar, User, CreditCard, Box, Archive, FileText } from "lucide-react";

/**
 * Modal para ver detalles completos de una venta
 */
export default function SaleDetailsModal({
    isOpen,
    onClose,
    sale,
    loading = false,
}) {
    // Manejar tecla Escape para cerrar
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // console.log(sale); 

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div
                className="bg-[var(--card)] border border-[var(--border)] w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--aside)]/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand/10 rounded-lg text-brand">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wide">
                                Detalle de Venta
                            </h2>
                            {sale && (
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">
                                    ID: {sale.id}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
                    >
                        <X size={18} className="text-zinc-500" />
                    </button>
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                            <p className="text-zinc-500 text-sm font-medium animate-pulse">
                                Cargando detalles...
                            </p>
                        </div>
                    ) : !sale ? (
                        <div className="text-center py-20 text-zinc-500">
                            No se pudo cargar la información de la venta.
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Información General */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={14} className="text-zinc-500" />
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Fecha y Hora
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-[var(--foreground)]">
                                        {new Date(sale.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {new Date(sale.created_at).toLocaleTimeString()}
                                    </p>
                                </div>

                                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={14} className="text-zinc-500" />
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Vendedor
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                        {sale.profile_id ? `ID: ${sale.profile_id.substring(0, 8)}...` : "Desconocido"}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {sale.profiles?.full_name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {sale.is_finalized ? "Venta Finalizada" : "En Proceso"}
                                    </p>
                                </div>

                                <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--border)]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CreditCard size={14} className="text-zinc-500" />
                                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                            Método Pago
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-[var(--foreground)] capitalize">
                                        {sale.payment_method}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        TicketBAI: {sale.tbai_code ? "Generado" : "Pendiente"}
                                    </p>
                                </div>
                            </div>

                            {/* Lista de Productos */}
                            <div>
                                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Box size={14} />
                                    Productos ({sale.sale_items?.length || 0})
                                </h3>
                                <div className="border border-[var(--border)] rounded-xl overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[var(--aside)] border-b border-[var(--border)]">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-zinc-500 text-[10px] uppercase tracking-wider">Producto</th>
                                                <th className="px-4 py-3 font-bold text-zinc-500 text-[10px] uppercase tracking-wider text-center">Cant.</th>
                                                <th className="px-4 py-3 font-bold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Precio U.</th>
                                                <th className="px-4 py-3 font-bold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)] bg-[var(--card)]">
                                            {sale.sale_items?.map((item, index) => (
                                                <tr key={index} className="hover:bg-[var(--background)]/50 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-[var(--foreground)]">
                                                            {item.product_name_at_sale || item.products?.name || "Producto desconocido"}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] text-zinc-500 font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                                                                {item.products?.sku || "SIN SKU"}
                                                            </span>
                                                            {item.batches && (
                                                                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                                                                    <Archive size={10} />
                                                                    Lote: {item.batches.batch_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-center font-bold text-zinc-600 dark:text-zinc-400">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-zinc-600 dark:text-zinc-400 font-mono">
                                                        {item.unit_price}€
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-bold text-[var(--foreground)] font-mono">
                                                        {(item.quantity * item.unit_price).toFixed(2)}€
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Totales */}
                            <div className="flex flex-col items-end border-t border-[var(--border)] pt-6">
                                <div className="w-full md:w-1/3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">Subtotal</span>
                                        <span className="font-mono text-[var(--foreground)]">
                                            {((sale.total_amount / 1.21).toFixed(2))}€
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-500">IVA (21%)</span>
                                        <span className="font-mono text-[var(--foreground)]">
                                            {(sale.total_amount - (sale.total_amount / 1.21)).toFixed(2)}€
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end pt-3 border-t border-[var(--border)]">
                                        <span className="text-base font-bold text-[var(--foreground)] uppercase tracking-wide">Total Pagado</span>
                                        <span className="text-2xl font-black text-brand font-mono">
                                            {Number(sale.total_amount).toFixed(2)}€
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-[var(--border)] bg-[var(--aside)]/50 shrink-0 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[var(--foreground)] transition-colors"
                    >
                        Cerrar
                    </button>
                    {/* Placeholder para futura implementación de impresión desde el historial */}
                    {/* <button className="px-4 py-2 bg-brand text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors flex items-center gap-2">
                <Printer size={14} />
                Imprimir Copia
            </button> */}
                </div>
            </div>
        </div>
    );
}
