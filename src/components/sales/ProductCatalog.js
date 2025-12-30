"use client";
import { memo } from "react";
import { Search, ShoppingCart, Plus, Minus, CreditCard, PackageX, Trash2, Check, Package } from "lucide-react";

// ==========================================
// Subcomponentes UI (Internos para simplicidad)
// ==========================================

/**
 * Tarjeta optimizada con React.memo para evitar re-renders innecesarios
 * Solo se actualiza si su prop 'quantityInCart' cambia.
 */
const ProductCard = memo(({ product, quantityInCart, onAdd }) => {
    const isOutOfStock = product.stock === 0;
    const isMaxReached = quantityInCart >= product.stock;
    const isDisabled = isOutOfStock || isMaxReached;

    return (
        <button
            disabled={isDisabled}
            onClick={() => onAdd(product)}
            className={`
        group relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 text-left w-full
        ${isDisabled
                    ? "opacity-60 bg-[var(--background)] border-[var(--border)] cursor-not-allowed"
                    : "bg-[var(--card)] border-[var(--border)] hover:border-brand hover:shadow-md cursor-pointer hover:-translate-y-0.5"
                }
      `}
        >
            {/* Badge de cantidad */}
            {quantityInCart > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm z-10 border-2 border-[var(--card)]">
                    {quantityInCart}
                </span>
            )}

            <div>
                <h3 className="font-bold text-[var(--foreground)] leading-tight">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-brand font-black text-lg">${product.base_price.toFixed(2)}</span>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                        {product.stock} in stock
                    </span>
                </div>
            </div>

            <div className={`
        w-10 h-10 rounded-lg flex items-center justify-center transition-colors
        ${isMaxReached
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-[var(--background)] text-zinc-400 group-hover:bg-brand group-hover:text-white"
                }
      `}>
                {isMaxReached ? <Check size={20} /> : <Plus size={20} />}
            </div>
        </button>
    );
});

ProductCard.displayName = "ProductCard";

// ==========================================
// Componente Principal: ProductCatalog
// ==========================================

export default function ProductCatalog({
    products = [],
    searchQuery,
    setSearchQuery,
    onAddToCart,
    getQuantity
}) {
    // Filtrado optimizado: si no hay query, devuelve la lista original (referencia estable)
    const filteredProducts = !searchQuery
        ? products
        : products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-full space-y-4">
            {/* Header & Búsqueda */}
            <div className="relative z-10">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="text-zinc-500" size={20} />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search items..."
                    className="w-full pl-10 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-medium text-sm shadow-sm text-[var(--foreground)] placeholder:text-zinc-500"
                />
            </div>

            {/* Grid de Productos - Con scroll independiente */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 pb-2">
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                        <Package size={40} strokeWidth={1.5} className="mb-2 opacity-50" />
                        <p className="text-sm font-medium">No products found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                quantityInCart={getQuantity(product.id)}
                                onAdd={onAddToCart}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Footer del catálogo (info rápida) */}
            <div className="text-[10px] text-zinc-500 text-center uppercase tracking-widest font-semibold pt-2 border-t border-[var(--border)]">
                {filteredProducts.length} items available
            </div>
        </div>
    );
}
