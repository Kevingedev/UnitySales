"use client";
import { useState, useEffect, useRef } from "react";
import {
  X,
  Banknote,
  CreditCard,
  Smartphone,
  Loader2,
  CheckCircle2,
  Calculator,
  ShoppingBag,
  Receipt,
  Package,
  Check,
  Printer,
  ShoppingCart,
} from "lucide-react";

const PAYMENT_METHODS = [
  { id: "cash", label: "Efectivo", icon: Banknote, color: "emerald" },
  { id: "card", label: "Tarjeta", icon: CreditCard, color: "blue" },
  { id: "bizum", label: "Bizum", icon: Smartphone, color: "purple" },
];

// Botones de acceso rápido para efectivo
const QUICK_AMOUNTS = [5, 10, 20, 50, 100];

/**
 * Modal de Confirmación de Pago (Layout de dos columnas)
 * Columna izquierda: Lista de artículos
 * Columna derecha: Resumen y confirmación de pago
 */
export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  items = [],
  totals = {
    totalPrice: 0,
    totalTax: 0,
    subtotal: 0,
    totalItems: 0,
    totalUnits: 0,
  },
  isProcessing = false,
  isSuccess = false,
  transactionId = null,
  onNewSale,
  onPrintTicket,
}) {
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cashGiven, setCashGiven] = useState("");
  const [changeAmount, setChangeAmount] = useState(0);
  const inputRef = useRef(null);

  // Resetear estado cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod("cash");
      setCashGiven("");
      setChangeAmount(0);
      // Focus en el input de efectivo después de un pequeño delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Calcular cambio cuando cambia el efectivo entregado
  useEffect(() => {
    const given = parseFloat(cashGiven) || 0;
    const change = given - totals.totalPrice;
    setChangeAmount(change >= 0 ? change : 0);
  }, [cashGiven, totals.totalPrice]);

  // Manejar tecla Escape para cerrar
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Prevenir doble clic
    if (isProcessing) return;

    // Para efectivo, validar que se haya dado suficiente dinero
    if (paymentMethod === "cash") {
      const given = parseFloat(cashGiven) || 0;
      if (given < totals.totalPrice) {
        return; // No procesar si no hay suficiente efectivo
      }
    }
    onConfirm(paymentMethod, parseFloat(cashGiven) || 0, changeAmount);
  };

  const handleQuickAmount = (amount) => {
    setCashGiven(amount.toString());
  };

  const isValidPayment =
    paymentMethod !== "cash" ||
    (parseFloat(cashGiven) || 0) >= totals.totalPrice;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div
        className={`bg-[var(--card)] border border-[var(--border)] ${
          isSuccess ? "max-w-lg" : "max-w-4xl"
        } max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========== ESTADO DE ÉXITO ========== */}
        {isSuccess && (
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            {/* Checkmark animado */}
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center animate-pulse-ring">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Check
                    className="w-12 h-12 text-emerald-500 animate-checkmark"
                    strokeWidth={3}
                  />
                </div>
              </div>
            </div>

            {/* Mensaje de éxito */}
            <h2 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tight mb-2">
              ¡Venta Exitosa!
            </h2>
            <p className="text-sm text-zinc-500 mb-6 text-center">
              La transacción se ha procesado correctamente
            </p>

            {/* Detalles de la transacción */}
            <div className="w-full bg-[var(--background)] rounded-xl p-4 mb-2 border border-[var(--border)]">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  ID de Transacción
                </span>
                <span className="text-sm font-mono font-bold text-[var(--foreground)]">
                  {transactionId?.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Método de Pago
                </span>
                <span className="text-sm font-bold text-[var(--foreground)] capitalize">
                  {paymentMethod === "cash"
                    ? "Efectivo"
                    : paymentMethod === "card"
                      ? "Tarjeta"
                      : "Bizum"}
                </span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-xl font-black text-brand">
                  ${totals.totalPrice.toFixed(2)}
                </span>
              </div>
              {paymentMethod === "cash" && changeAmount > 0 && (
                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-center">
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">
                    Cambio devuelto
                  </span>
                  <span className="text-lg font-black text-emerald-500">
                    ${changeAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="w-full grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={onPrintTicket}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-[var(--background)] border border-[var(--border)] rounded-xl hover:border-brand hover:text-brand transition-all font-bold text-sm uppercase tracking-wide"
              >
                <Printer size={18} />
                Imprimir
              </button>
              <button
                onClick={onNewSale}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-brand text-white rounded-xl hover:bg-brand-hover shadow-lg shadow-brand/25 transition-all font-bold text-sm uppercase tracking-wide"
              >
                <ShoppingCart size={18} />
                Nueva Venta
              </button>
            </div>
          </div>
        )}
        {/* Overlay de procesamiento */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center">
            <div className="text-center space-y-6 p-8">
              {/* Spinner animado */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-brand/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-3 border-4 border-brand/40 border-b-transparent rounded-full animate-spin-slow"></div>
              </div>

              {/* Texto de estado */}
              <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-wider">
                  Procesando Venta
                </h3>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-brand rounded-full animate-pulse"></div>
                  <p className="text-sm text-zinc-300 font-medium">
                    Actualizando inventario y registrando transacción
                  </p>
                  <div className="w-2 h-2 bg-brand rounded-full animate-pulse [animation-delay:0.2s]"></div>
                </div>
              </div>

              {/* Barra de progreso decorativa */}
              <div className="w-64 h-1.5 bg-zinc-700 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-gradient-to-r from-brand to-brand-hover rounded-full animate-progress"></div>
              </div>

              {/* Advertencia */}
              <p className="text-xs text-zinc-500 uppercase tracking-widest">
                Por favor, no cierre esta ventana
              </p>
            </div>
          </div>
        )}

        {/* ========== CONTENIDO NORMAL (cuando no es success) ========== */}
        {!isSuccess && (
          <>
            {/* Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--aside)]/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand/10 rounded-lg text-brand">
                  <Receipt size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-[var(--foreground)] uppercase tracking-wide">
                    Confirmar Venta
                  </h2>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                    Revisa los artículos y selecciona el método de pago
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} className="text-zinc-500" />
              </button>
            </div>

            {/* Contenido Principal - Dos Columnas */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-0 overflow-hidden">
              {/* ========== COLUMNA IZQUIERDA: Lista de Artículos ========== */}
              <div className="border-r border-[var(--border)] flex flex-col min-h-0 overflow-hidden">
                {/* Header de la lista */}
                <div className="p-4 border-b border-[var(--border)] bg-[var(--background)]/30 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag size={16} className="text-brand" />
                      <span className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wide">
                        Artículos en la venta
                      </span>
                    </div>
                    <span className="bg-brand/10 text-brand px-2 py-1 rounded-md text-[10px] font-bold">
                      {totals.totalItems}{" "}
                      {totals.totalItems === 1 ? "producto" : "productos"} ·{" "}
                      {totals.totalUnits}{" "}
                      {totals.totalUnits === 1 ? "unidad" : "unidades"}
                    </span>
                  </div>
                </div>

                {/* Lista scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                      <Package
                        size={32}
                        strokeWidth={1.5}
                        className="mb-2 opacity-50"
                      />
                      <p className="text-sm font-medium">No hay artículos</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[var(--foreground)] truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-zinc-500 font-mono uppercase">
                              {item.sku}
                            </span>
                            <span className="text-[10px] text-zinc-400">·</span>
                            <span className="text-[10px] text-zinc-500">
                              €{item.base_price.toFixed(2)} c/u
                            </span>
                            {item.tax_rate > 0 && (
                              <>
                                <span className="text-[10px] text-zinc-400">
                                  ·
                                </span>
                                <span className="text-[9px] text-zinc-400 bg-zinc-500/10 px-1.5 py-0.5 rounded">
                                  IVA {item.tax_rate}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4">
                          <div className="bg-[var(--card)] border border-[var(--border)] px-3 py-1 rounded-lg">
                            <span className="text-xs font-bold text-[var(--foreground)]">
                              x{item.quantity}
                            </span>
                          </div>
                          <div className="text-right min-w-[70px]">
                            <p className="text-sm font-black text-brand">
                              €{(item.base_price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Resumen de totales (parte inferior de columna izquierda) */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--aside)]/30 space-y-2 shrink-0">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Subtotal (Neto)</span>
                    <span className="text-[var(--foreground)]/70 font-mono font-medium">
                      €{(totals.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">IVA incluido</span>
                    <span className="text-[var(--foreground)]/70 font-mono font-medium">
                      €{(totals.totalTax || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-end pt-2 border-t border-[var(--border)]">
                    <span className="text-sm font-bold text-[var(--foreground)]">
                      TOTAL
                    </span>
                    <span className="text-xl font-black text-brand">
                      €{(totals.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ========== COLUMNA DERECHA: Método de Pago y Confirmación ========== */}
              <div className="flex flex-col min-h-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {/* Selector de Método de Pago */}
                  <div className="p-5 border-b border-[var(--border)]">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                      Método de Pago
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.id;
                        const colorClasses = {
                          emerald: isSelected
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
                            : "",
                          blue: isSelected
                            ? "border-blue-500 bg-blue-500/10 text-blue-500"
                            : "",
                          purple: isSelected
                            ? "border-purple-500 bg-purple-500/10 text-purple-500"
                            : "",
                        };

                        return (
                          <button
                            key={method.id}
                            onClick={() =>
                              !isProcessing && setPaymentMethod(method.id)
                            }
                            disabled={isProcessing}
                            className={`
                                                    p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2
                                                    ${
                                                      isSelected
                                                        ? colorClasses[
                                                            method.color
                                                          ]
                                                        : "border-[var(--border)] hover:border-zinc-400 text-zinc-500 hover:text-[var(--foreground)]"
                                                    }
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    ${!isProcessing && "active:scale-95"}
                                                `}
                          >
                            <Icon
                              size={28}
                              strokeWidth={isSelected ? 2.5 : 1.5}
                            />
                            <span className="text-xs font-bold uppercase tracking-wide">
                              {method.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Campo de Efectivo (solo si método es efectivo) */}
                  {paymentMethod === "cash" && (
                    <div className="p-5 bg-emerald-500/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Calculator size={14} className="text-emerald-500" />
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          Cálculo de Cambio
                        </p>
                      </div>

                      {/* Input de efectivo entregado */}
                      <div className="relative mb-3">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-zinc-400">
                          €
                        </span>
                        <input
                          ref={inputRef}
                          type="number"
                          value={cashGiven}
                          onChange={(e) => setCashGiven(e.target.value)}
                          placeholder="0.00"
                          disabled={isProcessing}
                          className="w-full pl-10 pr-4 py-4 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl
                                                focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all
                                                font-bold text-2xl text-[var(--foreground)] placeholder:text-zinc-400
                                                disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      {/* Botones de acceso rápido */}
                      <div className="flex gap-2 mb-4">
                        {QUICK_AMOUNTS.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => handleQuickAmount(amount)}
                            disabled={isProcessing}
                            className="flex-1 py-2.5 px-1 text-xs font-bold bg-[var(--card)] border border-[var(--border)]
                                                    rounded-lg hover:border-emerald-500 hover:text-emerald-500 transition-all
                                                    disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                          >
                            €{amount}
                          </button>
                        ))}
                      </div>

                      {/* Mostrar cambio */}
                      <div
                        className={`
                                        p-4 rounded-xl border-2 transition-all box-shadow shadow-sm
                                        ${
                                          (parseFloat(cashGiven) || 0) >=
                                          totals.totalPrice
                                            ? "bg-emerald-500/10 border-emerald-500/30"
                                            : "bg-red-500/10 border-red-500/30"
                                        }
                                    `}
                      >
                        <div className="flex justify-between items-center ">
                          <span className="text-sm font-bold text-[var(--foreground)]/70">
                            {(parseFloat(cashGiven) || 0) >= totals.totalPrice
                              ? "Cambio a devolver"
                              : "Falta por pagar"}
                          </span>
                          <span
                            className={`text-3xl font-black ${
                              (parseFloat(cashGiven) || 0) >= totals.totalPrice
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            €
                            {(parseFloat(cashGiven) || 0) >= totals.totalPrice
                              ? changeAmount.toFixed(2)
                              : (
                                  totals.totalPrice -
                                  (parseFloat(cashGiven) || 0)
                                ).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mensaje para otros métodos de pago */}
                  {paymentMethod !== "cash" && (
                    <div className="p-5">
                      <div
                        className={`
                                        p-6 rounded-xl border-2 text-center
                                        ${paymentMethod === "card" ? "bg-blue-500/5 border-blue-500/20" : "bg-purple-500/5 border-purple-500/20"}
                                    `}
                      >
                        <div
                          className={`
                                            w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center
                                            ${paymentMethod === "card" ? "bg-blue-500/10" : "bg-purple-500/10"}
                                        `}
                        >
                          {paymentMethod === "card" ? (
                            <CreditCard size={32} className="text-blue-500" />
                          ) : (
                            <Smartphone size={32} className="text-purple-500" />
                          )}
                        </div>
                        <p className="text-sm font-bold text-[var(--foreground)] mb-1">
                          Pago con{" "}
                          {paymentMethod === "card" ? "Tarjeta" : "Bizum"}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {paymentMethod === "card"
                            ? "Procesa el pago en el datáfono"
                            : "Solicita el pago por Bizum al cliente"}
                        </p>
                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                          <p className="text-[10px] text-zinc-400 uppercase tracking-wider mb-1">
                            Total a cobrar
                          </p>
                          <p
                            className={`text-3xl font-black ${paymentMethod === "card" ? "text-blue-500" : "text-purple-500"}`}
                          >
                            ${(totals.totalPrice || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botones de Acción (parte inferior de columna derecha) */}
                <div className="p-5 bg-[var(--aside)] border-t border-[var(--border)] flex gap-3 shrink-0">
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="flex-1 py-3.5 text-xs font-bold uppercase tracking-widest border border-[var(--border)]
                                    rounded-xl hover:bg-[var(--background)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={isProcessing || !isValidPayment}
                    className={`
                                    flex-1 py-3.5 text-xs font-bold uppercase tracking-widest rounded-xl
                                    flex items-center justify-center gap-2 transition-all
                                    ${
                                      isValidPayment && !isProcessing
                                        ? "bg-brand text-white hover:bg-brand-hover shadow-lg shadow-brand/25 active:scale-[0.98]"
                                        : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 cursor-not-allowed"
                                    }
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        Confirmar Venta
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
