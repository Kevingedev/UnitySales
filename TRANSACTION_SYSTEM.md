# 🎯 Sistema de "Cámara de Transacción" - Unity Sales

## 📖 Descripción General

El sistema de procesamiento de ventas implementa una **"Cámara de Transacción"** que gestiona el flujo completo desde que el empleado confirma el pago hasta que la venta queda registrada en el sistema.

---

## 🔄 Flujo Visual del Proceso

```
┌─────────────────────────────────────────────────────────────────┐
│  PASO 1: Empleado añade productos al carrito                   │
│  ✓ Búsqueda por nombre/SKU                                     │
│  ✓ Visualización de stock disponible                           │
│  ✓ Cálculo automático de IVA y totales                         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 2: Click en "Process Sale" → Abre Modal de Pago          │
│  ┌───────────────────┬───────────────────────────────────────┐ │
│  │ COLUMNA IZQUIERDA │ COLUMNA DERECHA                       │ │
│  │ Lista de Items    │ Selector de Método de Pago           │ │
│  │ ────────────────  │ ─────────────────────────────────     │ │
│  │ • Producto A x2   │ [💵 Efectivo] [💳 Tarjeta] [📱 Bizum]│ │
│  │ • Producto B x1   │                                       │ │
│  │ • Producto C x5   │ Si Efectivo:                          │ │
│  │                   │   Input: "Efectivo entregado: $____"  │ │
│  │ Subtotal: $85.00  │   Botones rápidos: $5 $10 $20...     │ │
│  │ IVA:      $15.00  │   Cambio: $5.00                       │ │
│  │ TOTAL:   $100.00  │                                       │ │
│  └───────────────────┴───────────────────────────────────────┘ │
│                                                                 │
│  Validaciones:                                                  │
│  ✓ Si efectivo: dinero >= total                                │
│  ✓ Botón "Confirmar Venta" solo activo si válido               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 3: CÁMARA DE TRANSACCIÓN (Estado de Carga) 🔒            │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│              ╔═══════════════════════════════╗                 │
│              ║  🔄  PROCESANDO VENTA         ║                 │
│              ║                               ║                 │
│              ║       ◉  ◉  ◉                 ║                 │
│              ║   Spinner Animado             ║                 │
│              ║                               ║                 │
│              ║  Actualizando inventario y    ║                 │
│              ║  registrando transacción      ║                 │
│              ║                               ║                 │
│              ║  ▓▓▓▓▓▓░░░░░░░░░░░           ║                 │
│              ║  Barra de progreso            ║                 │
│              ║                               ║                 │
│              ║  ⚠️ NO CIERRE ESTA VENTANA    ║                 │
│              ╚═══════════════════════════════╝                 │
│                                                                 │
│  Durante este estado:                                           │
│  🔒 Todos los botones deshabilitados                            │
│  🔒 No se puede cerrar el modal                                 │
│  🔒 No se puede cambiar método de pago                          │
│  🔒 Overlay oscuro impide clicks fuera                          │
│  🔒 Prevención de doble-click                                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: Procesamiento FIFO (sales-actions.js)                │
│  ════════════════════════════════════════════════════════════  │
│                                                                 │
│  1. Crear registro en tabla `sales`                             │
│     INSERT INTO sales (total_amount, payment_method, ...)       │
│                                                                 │
│  2. Para cada producto del carrito:                             │
│     ┌─────────────────────────────────────────────┐            │
│     │ a) Obtener lotes (FIFO)                     │            │
│     │    SELECT * FROM batches                    │            │
│     │    WHERE product_id = X AND stock > 0       │            │
│     │    ORDER BY received_at ASC                 │            │
│     │                                             │            │
│     │ b) Descontar de cada lote (antiguo → nuevo) │            │
│     │    Ejemplo: Venta de 30 unidades           │            │
│     │    • Lote A (2024-01-01): 20 → 0 ✓         │            │
│     │    • Lote B (2024-01-15): 30 → 20 ✓        │            │
│     │                                             │            │
│     │    UPDATE batches SET stock = ...           │            │
│     │                                             │            │
│     │ c) Registrar en sale_items                  │            │
│     │    INSERT INTO sale_items                   │            │
│     │    (sale_id, product_id, batch_id,          │            │
│     │     quantity, unit_price, tax_rate, ...)    │            │
│     │                                             │            │
│     │ d) Actualizar stock total del producto      │            │
│     │    UPDATE products                          │            │
│     │    SET stock = stock - quantity             │            │
│     └─────────────────────────────────────────────┘            │
│                                                                 │
│  3. Retornar resultado:                                         │
│     { success: true, transactionId: "uuid-123..." }            │
│                                                                 │
│  📝 Logs en consola:                                            │
│     🔄 Iniciando procesamiento de venta...                      │
│     📦 Items: 3                                                 │
│     💰 Total: $100.00                                           │
│     💳 Método: cash                                             │
│     ✅ Venta creada con ID: abc-def-123                         │
│     📦 Procesando: Producto A - Cantidad: 2                     │
│     📊 Stock disponible en lotes: 50                            │
│       🔹 Lote L001: 50 → 48 (deducción: 2)                     │
│     ✅ Stock total actualizado: 50 → 48                         │
│     🎉 Venta completada exitosamente!                           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 4: Estado de Éxito (Success Screen) ✅                   │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│              ╔═══════════════════════════════╗                 │
│              ║                               ║                 │
│              ║         ⭕ ✓                  ║                 │
│              ║    Checkmark Animado          ║                 │
│              ║    (pulso verde)              ║                 │
│              ║                               ║                 │
│              ║   ¡VENTA EXITOSA!             ║                 │
│              ║                               ║                 │
│              ║   ┌─────────────────────┐    ║                 │
│              ║   │ ID: abc-def-1...    │    ║                 │
│              ║   │ Método: Efectivo    │    ║                 │
│              ║   │ Total: $100.00      │    ║                 │
│              ║   │ Cambio: $5.00       │    ║                 │
│              ║   └─────────────────────┘    ║                 │
│              ║                               ║                 │
│              ║  [🖨️  Imprimir] [🛒 Nueva]   ║                 │
│              ║                               ║                 │
│              ╚═══════════════════════════════╝                 │
│                                                                 │
│  Opciones disponibles:                                          │
│  🖨️  "Imprimir Ticket" → Genera e imprime recibo              │
│  🛒 "Nueva Venta" → Limpia carrito y cierra modal              │
│                                                                 │
│  Características:                                               │
│  ✅ Modal cambia a diseño compacto (max-w-lg)                  │
│  ✅ Checkmark con animación de rebote                           │
│  ✅ Detalles de la transacción formateados                      │
│  ✅ Cambio resaltado (si pago en efectivo)                      │
│  ✅ No se puede cerrar con X (solo con botones)                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│  PASO 5: Acciones Post-Venta                                   │
│                                                                 │
│  Si selecciona "Nueva Venta":                                   │
│    ✅ Ejecuta clearCart()                                       │
│    ✅ Cierra modal (setIsPaymentModalOpen(false))              │
│    ✅ Resetea estados (isSuccess, transactionId)               │
│    ✅ LocalStorage limpio                                       │
│    ✅ Usuario puede iniciar nueva venta inmediatamente          │
│                                                                 │
│  Si selecciona "Imprimir Ticket":                               │
│    🖨️  Genera ticket con detalles de la venta                 │
│    🖨️  Envía a impresora térmica (pendiente)                  │
│    📄 Modal permanece abierto para más acciones                │
│                                                                 │
│  Si ERROR en transacción:                                       │
│    ❌ Modal permanece en vista de pago                          │
│    ❌ Alert: "Error en la transacción: [mensaje]"              │
│    ❌ Carrito NO se vacía (puede reintentar)                    │
│    ❌ Botones vuelven a estar activos                           │
│    ❌ Usuario puede corregir y reintentar                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Protecciones Anti-Duplicación

### Frontend (PaymentModal.js)

```javascript
// 1. Estado de procesamiento
const [isProcessing, setProcessing] = useState(false);

// 2. Prevención en handleConfirm
const handleConfirm = () => {
  if (isProcessing) return; // 🔒 BLOQUEO 1
  // ... resto del código
};

// 3. Botón deshabilitado
<button
  onClick={handleConfirm}
  disabled={isProcessing || !isValidPayment} // 🔒 BLOQUEO 2
  className={isProcessing ? "cursor-not-allowed opacity-50" : ""}
>

// 4. Overlay que bloquea toda interacción
{isProcessing && (
  <div className="absolute inset-0 z-50"> {/* 🔒 BLOQUEO 3 */}
    <Loader />
  </div>
)}

// 5. Botón de cerrar deshabilitado
<button onClick={onClose} disabled={isProcessing}> {/* 🔒 BLOQUEO 4 */}
```

### Backend (sales-actions.js)

```javascript
// 1. Función es "use server" - solo ejecuta en servidor
"use server"

// 2. Validaciones iniciales
if (!cartItems || cartItems.length === 0) {
  return { success: false, error: "El carrito está vacío" };
}

// 3. Try-catch global
try {
  // ... toda la lógica
} catch (error) {
  console.error("❌ Transaction error:", error);
  return { success: false, error: error.message };
}

// 4. Verificación de stock antes de procesar
if (product.stock < item.quantity) {
  throw new Error(`Stock insuficiente para ${item.name}`);
}
```

---

## 📊 Estructura de Datos

### Carrito (Frontend)
```javascript
cart = [
  {
    id: "prod-uuid-1",
    name: "Coca Cola 2L",
    sku: "BEB001",
    base_price: 2.50,    // Precio CON IVA incluido
    tax_rate: 21,        // % de IVA
    stock: 50,           // Stock disponible
    quantity: 2          // Cantidad en carrito
  },
  // ... más items
]
```

### Registro en `sales`
```sql
id: "sale-uuid-123"
profile_id: NULL (o user_id si tienes auth)
total_amount: 100.00
payment_method: "cash"
is_finalized: true
created_at: "2024-01-20 10:30:00"
```

### Registros en `sale_items`
```sql
-- Item 1 (usó Lote A completo)
{
  id: "item-uuid-1",
  sale_id: "sale-uuid-123",
  product_id: "prod-uuid-1",
  batch_id: "batch-uuid-A",
  quantity: 20,
  unit_price: 2.50,
  tax_rate: 21,
  line_total: 50.00
}

-- Item 2 (usó parte del Lote B)
{
  id: "item-uuid-2",
  sale_id: "sale-uuid-123",
  product_id: "prod-uuid-1",
  batch_id: "batch-uuid-B",
  quantity: 10,
  unit_price: 2.50,
  tax_rate: 21,
  line_total: 25.00
}
```

---

## 🎨 Animaciones CSS

### 1. Spinner Principal
```css
/* Doble anillo rotatorio */
.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite reverse;
}
```

### 2. Barra de Progreso
```css
.animate-progress {
  animation: progress 1.5s ease-in-out infinite;
}

@keyframes progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
```

### 3. Puntos Pulsantes
```css
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

## 🔍 Debugging

### Ver logs en consola del servidor

Cuando procesas una venta, deberías ver:

```bash
🔄 Iniciando procesamiento de venta...
📦 Items: 3
💰 Total: $100.00
💳 Método: cash
✅ Venta creada con ID: abc-def-123

📦 Procesando: Coca Cola 2L (BEB001) - Cantidad: 2
📊 Stock disponible en lotes: 50
  🔹 Lote L001: 50 → 48 (deducción: 2)
✅ Stock total actualizado: 50 → 48

📦 Procesando: Agua 1.5L (BEB002) - Cantidad: 5
📊 Stock disponible en lotes: 100
  🔹 Lote L002: 30 → 25 (deducción: 5)
✅ Stock total actualizado: 100 → 95

🎉 Venta completada exitosamente!
📋 ID de transacción: abc-def-123
```

### Verificar en Supabase

```sql
-- Ver la venta recién creada
SELECT * FROM sales ORDER BY created_at DESC LIMIT 1;

-- Ver los items de la venta
SELECT * FROM sale_items WHERE sale_id = 'abc-def-123';

-- Ver el estado de los lotes
SELECT * FROM batches WHERE product_id = 'prod-uuid-1';

-- Ver el stock actualizado
SELECT name, stock FROM products WHERE id = 'prod-uuid-1';
```

---

## ⚠️ Casos Especiales

### Producto sin lotes
Si un producto no tiene lotes en la tabla `batches`:
- Se crea `sale_item` con `batch_id = NULL`
- Se descuenta directamente de `products.stock`
- ⚠️ **Advertencia**: No hay trazabilidad FIFO

### Stock insuficiente
```javascript
// Error retornado:
{
  success: false,
  error: "Stock insuficiente para Coca Cola 2L. Disponible: 1, Solicitado: 5"
}
```

### Pago con efectivo insuficiente
```javascript
// Validación en frontend impide confirmar
const isValidPayment = paymentMethod !== 'cash' || 
                       (parseFloat(cashGiven) || 0) >= totals.totalPrice;

// Botón "Confirmar Venta" permanece deshabilitado
```

---

## 📝 Checklist de Implementación

- [x] Crear tabla `sale_items` en Supabase
- [x] Implementar `processTransaction` con lógica FIFO
- [x] Modal de pago de dos columnas
- [x] Selector de método de pago (Efectivo/Tarjeta/Bizum)
- [x] Input de efectivo con cálculo de cambio
- [x] Overlay de "Cámara de Transacción"
- [x] Prevención de doble-click
- [x] Deshabilitar botones durante procesamiento
- [x] Animaciones de carga
- [x] Logs detallados en backend
- [x] Manejo de errores
- [x] **Estado de éxito con checkmark animado** ✨
- [x] **Botones "Imprimir" y "Nueva Venta"** 🆕
- [x] **Limpieza de carrito tras confirmar nueva venta** 🆕
- [ ] Implementar generación de ticket PDF
- [ ] Integrar con impresora térmica

---

## 🎨 Animaciones Implementadas

### Checkmark de Éxito
```css
@keyframes checkmark {
    0% {
        transform: scale(0) rotate(-45deg);
        opacity: 0;
    }
    50% {
        transform: scale(1.2) rotate(0deg);
        opacity: 1;
    }
    100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
    }
}
```

### Pulso del Anillo
```css
@keyframes pulse-ring {
    0%, 100% {
        transform: scale(0.9);
        opacity: 0.5;
    }
    50% {
        transform: scale(1.05);
        opacity: 1;
    }
}
```

---

## 🚀 Próximos Pasos

1. **Impresión de Tickets**: Generar PDF con detalles de la venta ⏳
2. **TBAI Integration**: Integrar con sistema de facturación electrónica
3. **Reportes**: Dashboard con ventas por período
4. **Devoluciones**: Sistema para procesar devoluciones y reversar stock
5. **Alertas de Stock**: Notificar cuando stock < min_stock
6. **Caducidad de Lotes**: Alertas de productos próximos a caducar
7. **Email de recibo**: Enviar ticket por correo electrónico

---

## 📚 Archivos Relevantes

| Archivo | Descripción |
|---------|-------------|
| `src/lib/actions/sales-actions.js` | Lógica backend de procesamiento |
| `src/components/sales/PaymentModal.js` | Modal de confirmación de pago |
| `src/components/sales/Cart.js` | Componente del carrito |
| `src/components/sales/use-cart.js` | Hook para gestión del carrito |
| `src/app/(dashboard)/sales/point-of-sale/page.js` | Página principal de ventas |
| `database/create_sale_items_table.sql` | Script SQL para tabla |
| `src/app/globals.css` | Animaciones CSS (checkmark, progress, pulse) |

---

**Desarrollado con ❤️ para Unity Sales**