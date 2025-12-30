"use client";
import { ShoppingCart, PackageX, Minus, Plus, Trash2, Loader2, CreditCard } from "lucide-react";

/**
 * Componente principal del Carrito.
 * Integra la lista de items y la sección de checkout en una sola vista cohesiva.
 */
export default function Cart({
    items = [],
    totals = { totalPrice: 0, totalItems: 0, totalUnits: 0 },
    actions = { onIncrease: () => { }, onDecrease: () => { }, onRemove: () => { }, onCheckout: () => { } },
    isProcessing = false
}) {
    const isEmpty = items.length === 0;

    return (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col h-full shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden">

            {/* 1. Header del Carrito */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--aside)]/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-brand/10 rounded-lg text-brand">
                        <ShoppingCart size={18} />
                    </div>
                    <h2 className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wide">Current Order</h2>
                </div>
                <span className="bg-brand text-zinc-200 px-2.5 py-1 rounded-md text-[10px] font-bold">
                    {totals.totalItems} ITEMS
                </span>
            </div>

            {/* 2. Lista de Productos (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 relative">
                {isEmpty ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 p-8 text-center animate-in fade-in duration-500">
                        <div className="p-4 bg-[var(--background)] rounded-full mb-3 border border-[var(--border)]">
                            <PackageX size={32} strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-bold text-[var(--foreground)]/80">Your cart is empty</p>
                        <p className="text-xs mt-1 max-w-[180px] text-zinc-500">Select products from the catalog to start a sale</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col bg-[var(--background)] border border-[var(--border)] rounded-xl p-3 shadow-sm hover:border-brand/30 hover:shadow-md transition-all group"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="pr-4">
                                    <p className="text-sm font-bold text-[var(--foreground)] leading-snug">{item.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-medium font-mono mt-0.5 uppercase tracking-tighter">
                                        ${item.base_price.toFixed(2)} unit
                                    </p>
                                </div>
                                <p className="font-black text-sm text-brand">
                                    ${(item.base_price * item.quantity).toFixed(2)}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                {/* Selector de Cantidad */}
                                <div className="flex items-center bg-[var(--card)] rounded-lg border border-[var(--border)] p-1">
                                    <button
                                        onClick={() => actions.onDecrease(item.id)}
                                        disabled={item.quantity <= 1}
                                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-brand hover:bg-[var(--background)] disabled:opacity-30 transition-all"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-xs font-bold text-[var(--foreground)]">{item.quantity}</span>
                                    <button
                                        onClick={() => actions.onIncrease(item)}
                                        disabled={item.quantity >= item.stock}
                                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-500 hover:text-brand hover:bg-[var(--background)] disabled:opacity-30 transition-all"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>

                                {/* Botón Eliminar */}
                                <button
                                    onClick={() => actions.onRemove(item.id)}
                                    className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 3. Footer: Resumen y Checkout */}
            <div className="p-5 bg-[var(--aside)] border-t border-[var(--border)] space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-zinc-500">
                        <span>Subtotal ({totals.totalUnits} units)</span>
                        <span className="text-[var(--foreground)]/70">${totals.totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-end pt-2 border-t border-[var(--border)]">
                        <span className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight">Total to Pay</span>
                        <span className="text-2xl font-black text-brand tracking-tight">
                            ${totals.totalPrice.toFixed(2)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={actions.onCheckout}
                    disabled={isEmpty || isProcessing}
                    className={`
            w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-wider transition-all
            ${isEmpty || isProcessing
                            ? "bg-[var(--foreground)]/10 text-zinc-500 cursor-not-allowed"
                            : "bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/25 hover:shadow-xl active:scale-[0.98]"
                        }
          `}
                >
                    {isProcessing ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard size={18} />
                            Process Sale
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
