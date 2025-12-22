"use client";
// 1. IMPORTANTE: Faltaba importar useEffect
import { useState, useEffect } from "react";
import { Search, ShoppingCart, Plus, Minus, CreditCard, PackageX, Trash2 } from "lucide-react";
import { getProducts, processTransaction } from "@/lib/actions/sales-actions";

export default function SalesPage() {
  const [products, setProducts] = useState([]); // Datos del backend
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos del Backend al iniciar
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getProducts();
        if (response.success) {
          setProducts(response.products);
          // console.log(response.products);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);
// console.log(products);
  // 2. Acción de Finalizar Venta
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    const total = cart.reduce((acc, item) => acc + (item.base_price * item.quantity), 0);
    const result = await processTransaction(cart, total);

    if (result.success) {
      alert(`Transaction Successful! ID: ${result.transactionId}`);
      setCart([]);
    } else {
      alert("Error: " + result.error);
    }
  };

  // 3. CORRECCIÓN: Usar 'products' en lugar de 'PRODUCTS_DB'
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem && existingItem.quantity >= product.stock) return;

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const decreaseQuantity = (productId) => {
    setCart(cart.map(item => {
      if (item.id === productId && item.quantity > 1) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.base_price * item.quantity), 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-black uppercase tracking-widest text-xs animate-pulse">Loading Engineering Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-120px)]">

      {/* LEFT SECTION: PRODUCT DISCOVERY */}
      <div className="lg:col-span-2 space-y-4 flex flex-col">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-zinc-500" size={20} />
          <input
            type="text"
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-brand outline-none transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2">
          {filteredProducts.map(product => (
            <button
              key={product.id}
              disabled={product.stock === 0}
              className="p-4 bg-[var(--card)] border border-[var(--border)] rounded-xl flex justify-between items-center hover:border-brand transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => addToCart(product)}
            >
              <div className="text-left">
                <h3 className="font-bold text-[var(--foreground)]">{product.name}</h3>
                <p className="text-brand font-black text-lg">${product.base_price.toFixed(2)}</p>
                <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">
                  Stock: {product.stock} units
                </p>
              </div>
              <div className="p-2 bg-brand/10 text-brand rounded-lg group-hover:bg-brand group-hover:text-white transition-all">
                <Plus size={20} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT SECTION: CART & CHECKOUT */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-black/20">
        <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-brand" size={20} />
            <h2 className="font-black uppercase tracking-widest text-xs text-[var(--foreground)]">Current Sale</h2>
          </div>
          <span className="bg-brand/10 text-brand px-2 py-1 rounded text-[10px] font-black italic">
            {cart.length} ITEMS
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 opacity-40">
              <PackageX size={48} strokeWidth={1} />
              <p className="text-xs font-bold uppercase mt-4 tracking-tighter">Empty Cart</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="group flex flex-col bg-[var(--background)] p-3 rounded-xl border border-[var(--border)] transition-all">
                <div className="flex justify-between items-start mb-2">
                  <div className="max-w-[140px]">
                    <p className="text-sm font-bold leading-tight truncate text-[var(--foreground)]">{item.name}</p>
                    <p className="text-[10px] font-mono text-zinc-500 italic">${item.base_price.toFixed(2)}/unit</p>
                  </div>
                  <p className="font-black text-sm text-brand">${(item.base_price * item.quantity).toFixed(2)}</p>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1 bg-[var(--card)] rounded-lg border border-[var(--border)] p-1">
                    <button onClick={() => decreaseQuantity(item.id)} className="p-1 hover:bg-brand/10 text-zinc-500 hover:text-brand rounded"><Minus size={14} /></button>
                    <span className="text-xs font-black w-8 text-center text-[var(--foreground)]">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="p-1 hover:bg-brand/10 text-zinc-500 hover:text-brand rounded"><Plus size={14} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-md"><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-[var(--aside)] border-t border-[var(--border)] space-y-4">
          <div className="flex justify-between text-lg font-black uppercase text-[var(--foreground)]">
            <span>Total</span>
            <span className="text-brand">${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-20 shadow-xl shadow-brand/20 active:scale-[0.98]"
          >
            <CreditCard size={18} /> Complete Transaction
          </button>
        </div>
      </div>
    </div>
  );
}