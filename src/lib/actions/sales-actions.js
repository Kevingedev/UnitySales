// Funciones para leer y escribir en la base de datos Supabase.

"use server";

// Simulamos una base de datos persistente en memoria para esta etapa de desarrollo
// En el siguiente paso la conectaremos a Supabase/PostgreSQL
let MOCK_PRODUCTS = [
  { id: "p1", name: "Whole Milk 1L", category: "Dairy", price: 1.20, stock: 50 },
  { id: "p2", name: "Sliced Bread", category: "Bakery", price: 2.50, stock: 15 },
];

/**
 * FETCH: Obtener todos los productos
 */
export async function getProducts() {
  try {
    // Aquí iría: return await prisma.product.findMany()
    return { success: true, data: MOCK_PRODUCTS };
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







