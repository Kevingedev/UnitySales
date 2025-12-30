"use client";
import { useState, useEffect } from "react";
import { getProducts, processTransaction } from "@/lib/actions/sales-actions";
import { ProductCatalog, Cart, useCart } from "@/components/sales";

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Hook optimizado con persistencia
  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
    totalUnits,
    getQuantity,
    isLoaded
  } = useCart();

  // Carga inicial de datos
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await getProducts();
        if (response.success) {
          setProducts(response.products);
        }
      } catch (error) {
        console.error("Error loading catalogue:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setProcessing(true);
    try {
      const result = await processTransaction(cart, totalPrice);
      if (result.success) {
        alert(`Transaction Successful! ID: ${result.transactionId}`);
        clearCart();
      } else {
        alert("Transaction Failed: " + result.error);
      }
    } catch (error) {
      alert("System Error: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Prevenir flash de contenido incorrecto antes de cargar localStorage
  if (!isLoaded || loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase animate-pulse">Initializing Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
      {/* Columna Izquierda: Catálogo (7/12) */}
      <div className="lg:col-span-7 h-full overflow-hidden">
        <ProductCatalog
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddToCart={addToCart}
          getQuantity={getQuantity}
        />
      </div>

      {/* Columna Derecha: Carrito (5/12) */}
      <div className="lg:col-span-5 h-full overflow-hidden">
        <Cart
          items={cart}
          totals={{ totalPrice, totalItems, totalUnits }}
          actions={{
            onIncrease: addToCart,
            onDecrease: decreaseQuantity,
            onRemove: removeFromCart,
            onCheckout: handleCheckout
          }}
          isProcessing={processing}
        />
      </div>
    </div>
  );
}