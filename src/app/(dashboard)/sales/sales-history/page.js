"use client";
import { useState, useEffect, useCallback } from "react";
import { getSalesHistoryView } from "@/lib/actions/sales-actions";
import {
  Search,
  Calendar,
  DollarSign,
  CreditCard,
  Banknote,
  Smartphone,
  Package,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Eye,
  Filter,
} from "lucide-react";

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  // Función para cargar ventas
  const fetchSales = useCallback(async (page, search) => {
    setLoading(true);
    try {
      const response = await getSalesHistoryView(page, itemsPerPage, search);
      console.log("📊 Sales response:", response); // Debug
      if (response.success) {
        setSales(response.sales || []);
        setTotalPages(response.totalPages || 0);
        setTotalCount(response.totalCount || 0);
        console.log(
          "✅ Loaded:",
          response.sales?.length,
          "sales - Page",
          page,
          "of",
          response.totalPages,
        ); // Debug
      } else {
        console.error("Error loading sales:", response.error);
        setSales([]);
      }
    } catch (error) {
      console.error("Error loading sales history:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    fetchSales(currentPage, searchQuery);
  }, [currentPage, fetchSales]);

  // Debounce para búsqueda
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset a primera página en búsqueda
      fetchSales(1, searchQuery);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchSales]);

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Resetear horas para comparación de días
    const dateOnly = new Date(date.toDateString());
    const todayOnly = new Date(today.toDateString());
    const yesterdayOnly = new Date(yesterday.toDateString());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return `Hoy ${date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return `Ayer ${date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  // Icono de método de pago
  const PaymentIcon = ({ method }) => {
    const icons = {
      cash: Banknote,
      card: CreditCard,
      bizum: Smartphone,
    };
    const Icon = icons[method] || DollarSign;
    return <Icon size={16} />;
  };

  // Color del método de pago
  const getPaymentColor = (method) => {
    const colors = {
      cash: "text-emerald-500 bg-emerald-500/10",
      card: "text-blue-500 bg-blue-500/10",
      bizum: "text-purple-500 bg-purple-500/10",
    };
    return colors[method] || "text-zinc-500 bg-zinc-500/10";
  };

  // Estado de carga
  if (loading && sales.length === 0) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase animate-pulse">
            Loading sales history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-1 h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tight">
            Historial de Ventas
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            {totalCount}{" "}
            {totalCount === 1 ? "venta registrada" : "ventas registradas"}
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="text-zinc-500" size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ID o productos..."
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--card)] border border-[var(--border)] rounded-xl focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all font-medium text-sm shadow-sm text-[var(--foreground)] placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="flex-1 overflow-hidden bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm">
        <div className="overflow-x-auto h-full">
          {sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500 p-8">
              <div className="p-4 bg-[var(--background)] rounded-full mb-3 border border-[var(--border)]">
                <Receipt size={32} strokeWidth={1.5} className="opacity-50" />
              </div>
              <p className="text-sm font-bold text-[var(--foreground)]/80">
                No se encontraron ventas
              </p>
              {searchQuery && (
                <p className="text-xs text-zinc-400 mt-1">
                  Intenta con otro término de búsqueda
                </p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--aside)] border-b border-[var(--border)] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    ID Transacción
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Productos
                  </th>
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Método
                  </th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {sales.map((sale) => (
                  <tr
                    key={sale.sale_id}
                    className="hover:bg-[var(--background)]/50 transition-colors"
                  >
                    {/* Número */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-zinc-500">
                        {(currentPage - 1) * itemsPerPage +
                          sales.indexOf(sale) +
                          1}
                      </span>
                    </td>

                    {/* Fecha */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-400" />
                        <span className="text-sm font-medium text-[var(--foreground)]">
                          {formatDate(sale.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* ID Transacción */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-500 bg-[var(--background)] px-2 py-1 rounded border border-[var(--border)]">
                          {sale.sale_id.substring(0, 8)}...
                        </span>
                      </div>
                    </td>

                    {/* Productos */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-brand shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">
                            {sale.items_summary}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {sale.total_items_count}{" "}
                            {sale.total_items_count === 1
                              ? "artículo"
                              : "artículos"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Método de pago */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${getPaymentColor(sale.payment_method)}`}
                      >
                        <PaymentIcon method={sale.payment_method} />
                        {sale.payment_method === "cash"
                          ? "Efectivo"
                          : sale.payment_method === "card"
                            ? "Tarjeta"
                            : sale.payment_method === "bizum"
                              ? "Bizum"
                              : sale.payment_method}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-lg font-black text-brand">
                        ${parseFloat(sale.total_amount).toFixed(2)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => alert(`Ver detalles de ${sale.sale_id}`)}
                        className="p-2 hover:bg-brand/10 rounded-lg text-zinc-500 hover:text-brand transition-colors"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--card)] border border-[var(--border)] rounded-xl">
        <div className="text-sm text-zinc-500">
          Página {currentPage} de {totalPages || 1} ({totalCount}{" "}
          {totalCount === 1 ? "venta" : "ventas"})
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                      currentPage === pageNum
                        ? "bg-brand text-white"
                        : "hover:bg-[var(--background)] text-[var(--foreground)]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages || loading}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
