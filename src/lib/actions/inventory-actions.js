"use server";
import { createClient } from "@/lib/supabase-server";

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