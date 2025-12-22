// Funciones para leer y escribir en la base de datos Supabase.

"use server";

// Simulamos una base de datos persistente en memoria para esta etapa de desarrollo
// En el siguiente paso la conectaremos a Supabase/PostgreSQL
import { createClient } from "@/lib/supabase-server";
/**
 * FETCH: Obtener todos los productos
 */
export async function getProducts() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('*');

    if (error) throw error;

    return { success: true, products: data };
  } catch (error) {
    return { success: false, error: "Database connection failed" };
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







