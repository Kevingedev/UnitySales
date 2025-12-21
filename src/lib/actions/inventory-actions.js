"use server";
import { createClient } from "@/lib/supabase-server";

// Función para obtener el inventario de la base de datos
export async function getInventory() {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, products: data };
  } catch (error) {
    console.error("Inventory Error:", error.message);
    return { success: false, products: [] };
  }
}

// Funncion para agregar un nuevo batch
export async function createProduct(formData) {
  const supabase = await createClient(); // Conexión a la base de datos
  
  const productData = {
    sku: formData.get("sku"), // SKU del producto
    name: formData.get("name"), // Nombre del producto
    category: formData.get("category"), // Categoría del producto
    base_price: parseFloat(formData.get("base_price")), // Precio base del producto
    cost_price: parseFloat(formData.get("cost_price")), // Precio de costo del producto
    stock: parseInt(formData.get("stock")), // Stock del producto
    min_stock: parseInt(formData.get("min_stock")), // Stock mínimo del producto
    expiration_date: formData.get("expiration_date") || null, // Fecha de expiración del producto
  };

  const { data, error } = await supabase // Insertar el producto en la base de datos
    .from('products')
    .insert([productData]) // Insertar los datos del producto en la base de datos
    .select();

  if (error) { // Si hay un error, mostrar el mensaje de error
    console.error("Error al crear producto:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data }; // Si no hay error, devolver los datos del producto
}