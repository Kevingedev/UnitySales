// Funciones para leer y escribir en la base de datos Supabase.

"use server";

import { createClient } from "@/lib/supabase-server";

/**
 * FETCH: Obtener todos los productos para ventas (con filtro opcional de búsqueda)
 * @param {string} search - Término de búsqueda opcional para filtrar por nombre o SKU
 */
export async function getProducts(search = "") {
  try {
    const supabase = await createClient();
    let query = supabase.from("products").select("*");

    // Aplicar filtro de búsqueda si se proporciona
    if (search && search.trim()) {
      const searchValue = search.trim();
      query = query.or(
        `name.ilike.%${searchValue}%,sku.ilike.%${searchValue}%`,
      );
    }

    const { data, error } = await query.range(0, 9);

    if (error) throw error;

    return { success: true, products: data || [] };
  } catch (error) {
    console.error("Error fetching products for sales:", error);
    return {
      success: false,
      error: "Database connection failed",
      products: [],
    };
  }
}

/**
 * TRANSACTION: Registrar una venta y descontar stock usando FIFO
 *
 * Proceso:
 * 1. Crear registro en tabla 'sales'
 * 2. Para cada producto del carrito:
 *    - Obtener lotes ordenados por fecha (FIFO - más antiguos primero)
 *    - Descontar stock de cada lote hasta completar la cantidad vendida
 *    - Registrar cada deducción en 'sale_items'
 *    - Actualizar stock total del producto
 *
 * @param {Array} cartItems - Items del carrito [{id, name, sku, base_price, tax_rate, quantity, ...}]
 * @param {number} total - Total de la venta
 * @param {string} paymentMethod - Método de pago ('cash', 'card', 'bizum', 'other')
 */
export async function processTransaction(
  cartItems,
  total,
  paymentMethod = "cash",
) {
  const supabase = await createClient();

  try {
    // Validaciones básicas
    if (!cartItems || cartItems.length === 0) {
      return { success: false, error: "El carrito está vacío" };
    }

    if (total <= 0) {
      return { success: false, error: "El total debe ser mayor a 0" };
    }

    console.log("🔄 Iniciando procesamiento de venta...");
    console.log(`📦 Items: ${cartItems.length}`);
    console.log(`💰 Total: $${total}`);
    console.log(`💳 Método: ${paymentMethod}`);

    // 1. Crear el registro de venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        total_amount: total,
        payment_method: paymentMethod,
        is_finalized: true,
      })
      .select()
      .single();

    if (saleError) {
      console.error("❌ Error creating sale:", saleError);
      throw new Error(`Error al crear la venta: ${saleError.message}`);
    }

    console.log(`✅ Venta creada con ID: ${sale.id}`);

    // 2. Procesar cada item del carrito
    for (const item of cartItems) {
      let remainingQty = item.quantity;
      console.log(
        `\n📦 Procesando: ${item.name} (${item.sku}) - Cantidad: ${remainingQty}`,
      );

      // 2.1 Obtener lotes del producto con stock disponible, ordenados por FIFO
      const { data: batches, error: batchError } = await supabase
        .from("batches")
        .select("*")
        .eq("product_id", item.id)
        .gt("stock", 0)
        .order("received_at", { ascending: true }); // FIFO: lotes más antiguos primero

      if (batchError) {
        console.error("❌ Error fetching batches:", batchError);
        throw new Error(
          `Error al obtener lotes del producto ${item.name}: ${batchError.message}`,
        );
      }

      // 2.2 Verificar que hay suficiente stock en los lotes
      const totalBatchStock =
        batches?.reduce((sum, b) => sum + b.stock, 0) || 0;

      console.log(`📊 Stock disponible en lotes: ${totalBatchStock}`);

      if (totalBatchStock < item.quantity) {
        // Si no hay suficiente stock en lotes, verificamos stock del producto directamente
        // Esto permite ventas de productos sin lotes (stock directo)
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (productError || !product || product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para ${item.name}. Disponible: ${product?.stock || 0}, Solicitado: ${item.quantity}`,
          );
        }

        console.log(`⚠️  Producto sin lotes suficientes, usando stock directo`);

        // Producto sin lotes: crear un sale_item sin batch_id
        const { error: saleItemError } = await supabase
          .from("sale_items")
          .insert({
            sale_id: sale.id,
            product_id: item.id,
            batch_id: null,
            quantity: item.quantity,
            unit_price: item.base_price,
            // tax_rate: item.tax_rate || 0,
            // line_total: item.quantity * item.base_price,
          });

        if (saleItemError) {
          console.error("❌ Error creating sale item:", saleItemError);
          throw new Error(
            `Error al registrar item de venta: ${saleItemError.message}`,
          );
        }

        // Actualizar stock del producto directamente
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: product.stock - item.quantity })
          .eq("id", item.id);

        if (updateError) {
          throw new Error(
            `Error al actualizar stock del producto: ${updateError.message}`,
          );
        }

        console.log(
          `✅ Stock actualizado: ${product.stock} → ${product.stock - item.quantity}`,
        );
        continue; // Pasar al siguiente item del carrito
      }

      // 2.3 Descontar de cada lote usando FIFO
      for (const batch of batches) {
        if (remainingQty <= 0) break;

        const deductFromBatch = Math.min(batch.stock, remainingQty);

        console.log(
          `  🔹 Lote ${batch.batch_number}: ${batch.stock} → ${batch.stock - deductFromBatch} (deducción: ${deductFromBatch})`,
        );

        // Actualizar stock del lote
        const { error: batchUpdateError } = await supabase
          .from("batches")
          .update({ stock: batch.stock - deductFromBatch })
          .eq("id", batch.id);

        if (batchUpdateError) {
          console.error("❌ Error updating batch stock:", batchUpdateError);
          throw new Error(
            `Error al actualizar lote: ${batchUpdateError.message}`,
          );
        }

        // Insertar en sale_items (un registro por cada lote usado)
        const { error: saleItemError } = await supabase
          .from("sale_items")
          .insert({
            sale_id: sale.id,
            product_id: item.id,
            batch_id: batch.id,
            quantity: deductFromBatch,
            unit_price: item.base_price,
            // tax_rate: item.tax_rate || 0,
            // line_total: deductFromBatch * item.base_price,
          });

        if (saleItemError) {
          console.error("❌ Error creating sale item:", saleItemError);
          throw new Error(
            `Error al registrar item de venta: ${saleItemError.message}`,
          );
        }

        remainingQty -= deductFromBatch;
      }

      // 2.4 Actualizar stock total del producto
      const { data: currentProduct, error: productFetchError } = await supabase
        .from("products")
        .select("stock")
        .eq("id", item.id)
        .single();

      if (productFetchError) {
        throw new Error(
          `Error al obtener producto: ${productFetchError.message}`,
        );
      }

      const newStock = currentProduct.stock - item.quantity;

      const { error: productUpdateError } = await supabase
        .from("products")
        .update({ stock: newStock })
        .eq("id", item.id);

      if (productUpdateError) {
        throw new Error(
          `Error al actualizar stock del producto: ${productUpdateError.message}`,
        );
      }

      console.log(
        `✅ Stock total actualizado: ${currentProduct.stock} → ${newStock}`,
      );
    }

    console.log(`\n🎉 Venta completada exitosamente!`);
    console.log(`📋 ID de transacción: ${sale.id}`);

    return {
      success: true,
      transactionId: sale.id,
      message: "Venta procesada correctamente",
    };
  } catch (error) {
    console.error("❌ Transaction error:", error);
    return {
      success: false,
      error: error.message || "Error al procesar la transacción",
    };
  }
}

/**
 * Obtener historial de ventas desde la vista (optimizado para listado)
 * @param {number} page - Página actual (1-based)
 * @param {number} limit - Cantidad de ventas por página
 * @param {string} search - Término de búsqueda opcional
 */
export async function getSalesHistoryView(page = 1, limit = 20, search = "") {
  try {
    const supabase = await createClient();

    // Calcular rango para paginación
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    console.log(
      `📊 [getSalesHistoryView] Request - Page: ${page}, Limit: ${limit}, Search: "${search}"`,
    );
    console.log(`📊 [getSalesHistoryView] Range: ${from} to ${to}`);

    // Intentar primero desde la vista
    let query = supabase
      .from("sales_history")
      .select("*", { count: "exact" });

    // Aplicar filtro de búsqueda si existe
    if (search && search.trim()) {
      const searchValue = search.trim();
      query = query.or(
        `sale_id.ilike.%${searchValue}%,items_summary.ilike.%${searchValue}%,payment_method.ilike.%${searchValue}%`,
      );
    }

    // Ordenar y paginar
    let { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    // Si la vista no existe, hacer fallback a query directo
    if (error && error.message.includes("does not exist")) {
      console.warn(
        "⚠️  Vista 'sales_history' no existe, usando query directo",
      );

      // Query alternativo usando las tablas directamente
      const salesQuery = supabase
        .from("sales")
        .select(
          `
          id,
          created_at,
          total_amount,
          payment_method,
          is_finalized,
          tbai_code,
          sale_items (
            quantity,
            products (
              name
            )
          )
        `,
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .range(from, to);

      const salesResult = await salesQuery;

      if (salesResult.error) throw salesResult.error;

      // Transformar datos al formato esperado
      data = salesResult.data.map((sale, index) => {
        const itemsSummary = sale.sale_items
          .map(
            (item) => `${item.products?.name || "Unknown"} (x${item.quantity})`,
          )
          .join(", ");

        return {
          idx: from + index,
          sale_id: sale.id,
          created_at: sale.created_at,
          total_amount: sale.total_amount,
          payment_method: sale.payment_method,
          is_finalized: sale.is_finalized,
          tbai_code: sale.tbai_code,
          seller_name: null,
          items_summary: itemsSummary || "Sin productos",
          total_items_count: sale.sale_items.length,
        };
      });

      count = salesResult.count;
      error = null;
    }

    if (error) {
      console.error("❌ [getSalesHistoryView] Error:", error);
      throw error;
    }

    const totalPages = Math.ceil((count || 0) / limit);
    console.log(
      `✅ [getSalesHistoryView] Response - Found ${count} total sales, ${data?.length} on this page`,
    );
    console.log(`✅ [getSalesHistoryView] Total pages: ${totalPages}`);

    return {
      success: true,
      sales: data || [],
      totalCount: count || 0,
      currentPage: page,
      totalPages: totalPages,
    };
  } catch (error) {
    console.error("❌ [getSalesHistoryView] Fatal error:", error);
    return {
      success: false,
      error: error.message,
      sales: [],
      totalCount: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
}

/**
 * Obtener historial de ventas (para reportes futuros)
 * @param {number} limit - Cantidad de ventas a obtener
 */
export async function getSalesHistory(limit = 50) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items (
          *,
          products (name, sku)
        )
      `,
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { success: true, sales: data || [] };
  } catch (error) {
    console.error("Error fetching sales history:", error);
    return { success: false, error: error.message, sales: [] };
  }
}

/**
 * Obtener detalles de una venta específica
 * @param {string} saleId - ID de la venta
 */
export async function getSaleDetails(saleId) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("sales")
      .select(
        `
        *,
        sale_items (
          *,
          products (name, sku),
          batches (batch_number)
        )
      `,
      )
      .eq("id", saleId)
      .single();

    if (error) throw error;

    return { success: true, sale: data };
  } catch (error) {
    console.error("Error fetching sale details:", error);
    return { success: false, error: error.message };
  }
}
