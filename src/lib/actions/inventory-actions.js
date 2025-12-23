"use server";
import { createClient } from "@/lib/supabase-server";

// Función para obtener el inventario de la base de datos
export async function getInventory() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
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
    category_id: formData.get("category"), // Categoría del producto
    base_price: parseFloat(formData.get("base_price")), // Precio base del producto
    cost_price: parseFloat(formData.get("cost_price")), // Precio de costo del producto
    stock: parseInt(formData.get("stock") || 0), // Stock del producto
    min_stock: parseInt(formData.get("min_stock") || 0), // Stock mínimo del producto
    //expiration_date: formData.get("expiration_date") || null, // Fecha de expiración del producto
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

export async function deleteProduct(id) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    console.error("Error deleting product:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateProduct(formData) {
  const supabase = await createClient();
  const id = formData.get("id");

  const productData = {
    sku: formData.get("sku"),
    name: formData.get("name"),
    category_id: formData.get("category"),
    base_price: parseFloat(formData.get("base_price")),
    cost_price: parseFloat(formData.get("cost_price")), // Assuming cost_price is in form or handled
    stock: parseInt(formData.get("stock")),
    min_stock: parseInt(formData.get("min_stock")),
    expiration_date: formData.get("expiration_date") || null,
  };

  // Remove cost_price if NaN (not in form?) - checking original file, createProduct uses it.
  // Ideally modal should have it too. For now let's trust formData has it or we handle it gracefully.
  // If cost_price is NaN, we might want to exclude it or set to 0? verify logic.
  if (isNaN(productData.cost_price)) delete productData.cost_price;

  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', id)
    .select();

  if (error) {
    console.error("Error updating product:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };
}

export async function createBatch(formData) {

  const supabase = await createClient();

  const batchData = {
    product_id: formData.get("product_id"),
    batch_number: formData.get("batch_number"),
    stock: formData.get("stock"),
    expiration_date: formData.get("expiration_date"),
    cost_per_unit: formData.get("cost_per_unit"),
  }

  const {data, error} = await supabase
    .from('batches')
    .insert([batchData])
    .select();

  if (error) {
    console.error("Error creating batch:", error.message);
    return { success: false, error: error.message };
  }
  return { success: true, data };

}


export async function getCategories() {

  const supabase = await createClient();

  const { data, error } = await supabase.from('categories').select('*');

  if (error) {
    console.error("Error fetching categories:", error.message);
    return { success: false, error: error.message };
  }

  if (!data) {
    console.error("No categories found");
    return { success: false, error: "No categories found" };
  }

  return { success: true, data };
}