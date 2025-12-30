"use client";
import { useState, useCallback, useMemo, useEffect } from "react";

const STORAGE_KEY = "unity_sales_cart";

/**
 * Hook profesional para gestión de carrito de ventas.
 * Incluye persistencia en localStorage y optimización de rendimiento usando Map.
 * 
 * @returns {Object} API del carrito
 */
export function useCart() {
    // Estado inicial lazy para leer de localStorage solo una vez al montar
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. Cargar estado persistente al montar (Client-side only)
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

    // 2. Guardar en localStorage cada vez que cambia el carrito
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // OPTIMIZACIÓN: Crear un mapa de acceso rápido { id: quantity }
    // Esto permite verificar stock en O(1) en lugar de O(N)
    const cartMap = useMemo(() => {
        return cart.reduce((acc, item) => {
            acc[item.id] = item.quantity;
            return acc;
        }, {});
    }, [cart]);

    // Acciones atomicas estables (useCallback para evitar re-renders en hijos)

    const addToCart = useCallback((product) => {
        setCart((prev) => {
            const currentQty = prev.find((p) => p.id === product.id)?.quantity || 0;

            // Validación de stock estricta
            if (currentQty >= product.stock) return prev;

            if (currentQty > 0) {
                return prev.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
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
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Totales memorizados
    const totals = useMemo(() => ({
        totalPrice: cart.reduce((acc, item) => acc + item.base_price * item.quantity, 0),
        totalItems: cart.length,
        totalUnits: cart.reduce((acc, item) => acc + item.quantity, 0)
    }), [cart]);

    // Función helper optimizada O(1)
    const getQuantity = useCallback((productId) => cartMap[productId] || 0, [cartMap]);

    return {
        cart,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getQuantity,
        ...totals,
        isLoaded // Para evitar hydration mismatch
    };
}
