// Funciones para leer y escribir en la base de datos Supabase.

"use server";

// Simulamos una base de datos persistente en memoria para esta etapa de desarrollo
// En el siguiente paso la conectaremos a Supabase/PostgreSQL
import { createClient } from "@/lib/supabase-server";
/**
 * FETCH: Obtener todos los productos para ventas (con filtro opcional de búsqueda)
 * @param {string} search - Término de búsqueda opcional para filtrar por nombre o SKU
 */
export async function getProducts(search = "") {
  try {
    const supabase = await createClient();
    let query = supabase.from('products').select('*');

    // Aplicar filtro de búsqueda si se proporciona
    if (search && search.trim()) {
      const searchValue = search.trim();
      query = query.or(`name.ilike.%${searchValue}%,sku.ilike.%${searchValue}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, products: data || [] };
  } catch (error) {
    console.error("Error fetching products for sales:", error);
    return { success: false, error: "Database connection failed", products: [] };
  }
}

/**
 * TRANSACTION: Registrar una venta y descontar stock
 */
export async function processTransaction(cartItems, total) {
  try {
    console.log("--- Backend Processing Sale ---");
    console.log("Items:", cartItems);
    console.log("Total Amount:", total);

    // Lógica de IA: Aquí podrías llamar a una función que analice 
    // la venta antes de guardarla para sugerencias de cross-selling.

    // 1. Aquí guardarías en la tabla 'Sales'
    // 2. Aquí actualizarías el stock en la tabla 'Inventory'

    return {
      success: true,
      transactionId: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
  } catch (error) {
    return { success: false, error: "Transaction failed" };
  }
}







