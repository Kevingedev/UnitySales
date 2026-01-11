# Sistema de Procesamiento de Transacciones - Unity Sales

Este directorio contiene los scripts SQL necesarios para el sistema de ventas con control de inventario FIFO.

## 📋 Estructura de Base de Datos

### Tablas Principales

#### 1. `sales`
Registra las ventas realizadas.

```sql
- id: UUID (PK)
- profile_id: UUID (FK a profiles)
- total_amount: NUMERIC(12,2)
- payment_method: TEXT ('cash', 'card', 'bizum', 'other')
- tbai_code: TEXT (único)
- tbai_qr: TEXT
- is_finalized: BOOLEAN
- created_at: TIMESTAMP
```

#### 2. `sale_items` ⭐ Nueva
Detalles de cada producto vendido en una transacción.

```sql
- id: UUID (PK)
- sale_id: UUID (FK a sales)
- product_id: UUID (FK a products)
- batch_id: UUID (FK a batches, nullable)
- quantity: INTEGER
- unit_price: NUMERIC(12,2)
- tax_rate: NUMERIC(5,2)
- line_total: NUMERIC(12,2)
- created_at: TIMESTAMP
```

#### 3. `products`
Productos del inventario.

```sql
- id: UUID (PK)
- sku: TEXT
- name: TEXT
- stock: INTEGER (suma de todos los lotes)
- base_price: NUMERIC(12,2)
- tax_rate: NUMERIC(5,2)
- ...
```

#### 4. `batches`
Lotes de productos con trazabilidad FIFO.

```sql
- id: UUID (PK)
- product_id: UUID (FK a products)
- batch_number: TEXT
- stock: INTEGER
- expiration_date: DATE
- received_at: TIMESTAMP (para ordenar FIFO)
- cost_per_unit: NUMERIC(12,2)
```

## 🚀 Instalación

### Paso 1: Crear tabla `sale_items`

Ejecuta el script en el editor SQL de Supabase:

```bash
# Abre Supabase Dashboard > SQL Editor > New Query
# Copia y pega el contenido de:
create_sale_items_table.sql
```

### Paso 2: Verificar tablas existentes

Asegúrate de que ya existen las tablas:
- ✅ `sales`
- ✅ `products`
- ✅ `batches`
- ✅ `profiles`

## 🔄 Flujo de Procesamiento de Ventas

### Algoritmo FIFO (First In, First Out)

Cuando se procesa una venta:

```
1. Cliente compra 30 unidades del Producto A
2. Sistema busca lotes ordenados por received_at ASC:
   - Lote 1 (2024-01-01): 20 unidades disponibles
   - Lote 2 (2024-01-15): 30 unidades disponibles
   
3. Deducción FIFO:
   - Descuenta 20 del Lote 1 → Lote 1 queda en 0
   - Descuenta 10 del Lote 2 → Lote 2 queda en 20
   
4. Registra en sale_items:
   - Item 1: sale_id, product_id, batch_id=Lote1, quantity=20
   - Item 2: sale_id, product_id, batch_id=Lote2, quantity=10
   
5. Actualiza products.stock: 50 - 30 = 20
```

### Productos sin Lotes

Si un producto no tiene lotes (batches vacío):
- Se registra en `sale_items` con `batch_id = NULL`
- Se descuenta directamente del campo `products.stock`

## 🎯 Funciones del Sistema

### `processTransaction(cartItems, total, paymentMethod)`

Función principal que ejecuta:

1. **Validación**
   - Carrito no vacío
   - Total > 0

2. **Creación de Venta**
   - Inserta en `sales`
   - Obtiene `sale_id`

3. **Procesamiento de Items** (para cada producto):
   ```javascript
   for (item of cartItems) {
     // Obtener lotes con stock > 0, ordenados por received_at ASC
     batches = getBatches(item.id)
     
     // Descontar usando FIFO
     for (batch of batches) {
       deduct = min(batch.stock, remainingQty)
       updateBatch(batch.id, batch.stock - deduct)
       insertSaleItem(sale_id, item, batch.id, deduct)
       remainingQty -= deduct
     }
     
     // Actualizar stock total del producto
     updateProduct(item.id, currentStock - item.quantity)
   }
   ```

4. **Respuesta**
   ```json
   {
     "success": true,
     "transactionId": "uuid-de-la-venta",
     "message": "Venta procesada correctamente"
   }
   ```

## 🛡️ Protecciones Implementadas

### En el Frontend
- ✅ Botón "Confirmar Venta" deshabilitado durante procesamiento
- ✅ Overlay de carga impide interacción
- ✅ Prevención de doble clic
- ✅ Validación de efectivo suficiente (para pago en efectivo)

### En el Backend
- ✅ Validaciones de datos
- ✅ Transacciones atómicas (si una falla, revierte todo)
- ✅ Verificación de stock antes de procesar
- ✅ Logs detallados para debugging

## 📊 Consultas Útiles

### Ver ventas con sus items
```sql
SELECT 
  s.id,
  s.total_amount,
  s.payment_method,
  s.created_at,
  si.quantity,
  p.name as product_name,
  b.batch_number
FROM sales s
LEFT JOIN sale_items si ON s.id = si.sale_id
LEFT JOIN products p ON si.product_id = p.id
LEFT JOIN batches b ON si.batch_id = b.id
ORDER BY s.created_at DESC;
```

### Stock actual por lote
```sql
SELECT 
  p.name,
  p.stock as total_stock,
  b.batch_number,
  b.stock as batch_stock,
  b.received_at
FROM products p
LEFT JOIN batches b ON p.id = b.product_id
WHERE b.stock > 0
ORDER BY p.name, b.received_at ASC;
```

### Ventas por método de pago (hoy)
```sql
SELECT 
  payment_method,
  COUNT(*) as num_sales,
  SUM(total_amount) as total
FROM sales
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY payment_method;
```

## 🐛 Troubleshooting

### Error: "relation sale_items does not exist"
**Solución:** Ejecuta `create_sale_items_table.sql`

### Error: "Stock insuficiente"
**Causa:** El producto no tiene suficiente stock
**Solución:** Verifica `products.stock` y los lotes disponibles

### Error: "foreign key violation"
**Causa:** Intentas eliminar un producto que tiene ventas
**Solución:** La constraint es `ON DELETE RESTRICT` - no puedes borrar productos vendidos

### Venta se procesa pero no descuenta stock
**Causa:** Error en la lógica FIFO o actualización de productos
**Solución:** Revisa los logs de consola en el servidor

## 📝 Notas Importantes

1. **Integridad Referencial:**
   - Si eliminas una venta (`DELETE FROM sales`), automáticamente se eliminan sus `sale_items` (CASCADE)
   - No puedes eliminar un producto que ha sido vendido (RESTRICT)
   - Si eliminas un lote, sus referencias en `sale_items` se setean a NULL (SET NULL)

2. **Cálculos de IVA:**
   - Los precios en `products.base_price` ya incluyen IVA
   - El sistema extrae la base imponible: `subtotal = price / (1 + tax_rate/100)`
   - El IVA se calcula: `tax = price - subtotal`

3. **Rastreabilidad:**
   - Cada `sale_item` guarda el `batch_id` usado
   - Permite auditorías y control de lotes con fecha de caducidad

## 🔐 Seguridad

- ✅ RLS (Row Level Security) debe estar habilitado
- ✅ Solo usuarios autenticados pueden crear ventas
- ✅ Los precios se toman de la base de datos (no del frontend)
- ✅ Validaciones en ambos lados (cliente y servidor)

## 📚 Más Información

- Ver código fuente: `src/lib/actions/sales-actions.js`
- Modal de pago: `src/components/sales/PaymentModal.js`
- Gestión de carrito: `src/components/sales/use-cart.js`
