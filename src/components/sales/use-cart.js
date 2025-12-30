"use client";
import { useState, useCallback, useMemo, useEffect } from "react";

const STORAGE_KEY = "unity_sales_cart";

/**
 * Hook profesional para gestión de carrito de ventas.
 * Optimizado para retail: Maneja precios con IVA incluido y extrae la base imponible.
 */
export function useCart() {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Cargar estado persistente al montar
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setCart(JSON.parse(stored));
            }
        } catch (e) {
            console.error("Error loading cart from storage", e);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // 2. Persistir cambios en localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // Mapa de acceso rápido para stock y UI
    const cartMap = useMemo(() => {
        return cart.reduce((acc, item) => {
            acc[item.id] = item.quantity;
            return acc;
        }, {});
    }, [cart]);

    const addToCart = useCallback((product) => {
        setCart((prev) => {
            const currentQty = prev.find((p) => p.id === product.id)?.quantity || 0;

            if (currentQty >= product.stock) return prev;

            if (currentQty > 0) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Aseguramos que el producto entre con su base_price y tax_rate de la DB
            return [...prev, { ...product, quantity: 1 }];
        });
    }, []);

    const decreaseQuantity = useCallback((productId) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === productId && item.quantity > 1) {
                    return { ...item, quantity: item.quantity - 1 };
                }
                return item;
            })
        );
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart((prev) => prev.filter((item) => item.id !== productId));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    /**
     * CÁLCULOS FINANCIEROS (RETAIL)
     * Basado en extracción de IVA desde Precio Final (PVP)
     */
    const totals = useMemo(() => {
        return cart.reduce((acc, item) => {
            const quantity = item.quantity;
            const pvpUnitario = item.base_price; // Lo que el cliente ve en estante
            const taxRate = item.tax_rate || 0;

            // 1. Total bruto de la línea (PVP total)
            const lineTotal = pvpUnitario * quantity;

            // 2. Extraer Base Imponible (Neto)
            // Usamos redondeo a 4 decimales para cálculos internos de precisión
            const lineNet = parseFloat((lineTotal / (1 + (taxRate / 100))).toFixed(4));

            // 3. Cuota de IVA (Diferencia)
            const lineTax = parseFloat((lineTotal - lineNet).toFixed(2));

            acc.subtotal += lineNet;
            acc.totalTax += lineTax;
            acc.totalPrice += lineTotal;
            acc.totalUnits += quantity;

            return acc;
        }, {
            subtotal: 0,
            totalTax: 0,
            totalPrice: 0,
            totalItems: cart.length,
            totalUnits: 0
        });
    }, [cart]);

    const getQuantity = useCallback((productId) => cartMap[productId] || 0, [cartMap]);

    return {
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getQuantity,
        // Totales formateados a 2 decimales para la UI
        subtotal: parseFloat(totals.subtotal.toFixed(2)),
        totalTax: parseFloat(totals.totalTax.toFixed(2)),
        totalPrice: parseFloat(totals.totalPrice.toFixed(2)),
        totalUnits: totals.totalUnits,
        totalItems: totals.totalItems,
        isLoaded
    };
}