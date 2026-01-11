"use client";
import { useState, useEffect, useCallback } from "react";
import { getProducts, processTransaction } from "@/lib/actions/sales-actions";
import {
  ProductCatalog,
  Cart,
  PaymentModal,
  useCart,
} from "@/components/sales";

export default function SalesPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  const [refreshingStock, setRefreshingStock] = useState(false);

  // Hook optimizado con persistencia
  const {
    cart,
    addToCart,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalTax,
    totalPrice,
    totalItems,
    totalUnits,
    getQuantity,
    isLoaded,
  } = useCart();

  // Función para cargar productos con filtro de búsqueda
  const fetchProducts = useCallback(async (search = "", isInitial = false) => {
    if (isInitial) {
      setInitialLoading(true);
    } else {
      setSearching(true);
    }
    try {
      const response = await getProducts(search);
      if (response.success) {
        setProducts(response.products || []);
      } else {
        console.error("Error loading products:", response.error);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading catalogue:", error);
      setProducts([]);
    } finally {
      if (isInitial) {
        setInitialLoading(false);
      } else {
        setSearching(false);
      }
    }
  }, []);

  // Carga inicial de datos
  useEffect(() => {
    fetchProducts("", true);
  }, [fetchProducts]);

  // Efecto para buscar productos cuando cambia el searchQuery (con debounce)
  useEffect(() => {
    // No hacer búsqueda en la carga inicial
    if (initialLoading) return;

    const timeoutId = setTimeout(() => {
      fetchProducts(searchQuery, false);
    }, 400); // Debounce de 400ms para evitar demasiadas consultas

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchProducts, initialLoading]);

  // Abrir modal de pago
  const handleOpenPaymentModal = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  // Cerrar modal de pago
  const handleClosePaymentModal = () => {
    if (processing) return;
    setIsPaymentModalOpen(false);
    setIsSuccess(false);
    setTransactionId(null);
  };

  // Procesar la venta con método de pago seleccionado
  const handleConfirmPayment = async (
    paymentMethod,
    cashGiven,
    changeAmount,
  ) => {
    setProcessing(true);
    try {
      const result = await processTransaction(cart, totalPrice, paymentMethod);
      if (result.success) {
        // ✅ OPTIMISTIC UPDATE: Actualizar stock local inmediatamente
        // Esto proporciona feedback instantáneo al usuario sin esperar
        // la recarga desde el servidor. El stock se actualizará con el
        // valor real del servidor cuando se haga clic en "Nueva Venta"
        setProducts((prevProducts) =>
          prevProducts.map((product) => {
            const cartItem = cart.find((item) => item.id === product.id);
            if (cartItem) {
              return {
                ...product,
                stock: Math.max(0, product.stock - cartItem.quantity),
              };
            }
            return product;
          }),
        );

        // Cambiar a estado de éxito
        setTransactionId(result.transactionId);
        setIsSuccess(true);
      } else {
        alert("Error en la transacción: " + result.error);
      }
    } catch (error) {
      alert("Error del sistema: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  // Manejar nueva venta (limpiar y cerrar)
  const handleNewSale = async () => {
    clearCart();
    setIsPaymentModalOpen(false);
    setIsSuccess(false);
    setTransactionId(null);

    // 🔄 REVALIDACIÓN: Refrescar el catálogo desde el servidor
    // Esto asegura que el stock mostrado sea el valor real de la base de datos
    // y sincroniza cualquier cambio que otros usuarios puedan haber hecho
    setRefreshingStock(true);
    try {
      await fetchProducts(searchQuery, false);
    } finally {
      // Pequeño delay (300ms) para suavizar la transición visual
      // y evitar que el spinner aparezca/desaparezca muy rápido
      setTimeout(() => setRefreshingStock(false), 300);
    }
  };

  // Manejar impresión de ticket
  const handlePrintTicket = () => {
    // TODO: Implementar generación e impresión de ticket
    alert("Función de impresión en desarrollo");
    console.log("Imprimir ticket para transacción:", transactionId);
    console.log("Items:", cart);
    console.log("Totales:", { subtotal, totalTax, totalPrice });
  };

  // Prevenir flash de contenido incorrecto antes de cargar localStorage o en carga inicial
  if (!isLoaded || initialLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            Initializing Terminal...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-120px)]">
        {/* Columna Izquierda: Catálogo (7/12) */}
        <div className="lg:col-span-7 h-full overflow-hidden">
          <ProductCatalog
            products={products}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToCart={addToCart}
            getQuantity={getQuantity}
            isLoading={searching || refreshingStock}
          />
        </div>

        {/* Columna Derecha: Carrito (5/12) */}
        <div className="lg:col-span-5 h-full overflow-hidden">
          <Cart
            items={cart}
            totals={{ subtotal, totalTax, totalPrice, totalItems, totalUnits }}
            actions={{
              onIncrease: addToCart,
              onDecrease: decreaseQuantity,
              onRemove: removeFromCart,
              onCheckout: handleOpenPaymentModal,
            }}
            isProcessing={processing}
          />
        </div>
      </div>

      {/* Modal de Confirmación de Pago */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        onConfirm={handleConfirmPayment}
        items={cart}
        totals={{ subtotal, totalTax, totalPrice, totalItems, totalUnits }}
        isProcessing={processing}
        isSuccess={isSuccess}
        transactionId={transactionId}
        onNewSale={handleNewSale}
        onPrintTicket={handlePrintTicket}
      />
    </>
  );
}
