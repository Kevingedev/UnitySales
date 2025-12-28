# 📖 Manual de Uso - Unity Sales v1.0

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Requisitos del Sistema](#requisitos-del-sistema)
3. [Acceso al Sistema](#acceso-al-sistema)
4. [Panel Principal (Dashboard)](#panel-principal-dashboard)
5. [Módulo de Ventas](#módulo-de-ventas)
6. [Módulo de Inventario](#módulo-de-inventario)
   - [Gestión de Productos](#gestión-de-productos)
   - [Gestión de Lotes](#gestión-de-lotes)
7. [Perfil de Usuario](#perfil-de-usuario)
8. [Módulo de Administración](#módulo-de-administración)
   - [Gestión de Navegación](#gestión-de-navegación)
   - [Gestión de Permisos (RBAC)](#gestión-de-permisos-rbac)
9. [Interfaz y Navegación](#interfaz-y-navegación)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

**Unity Sales** es una aplicación web moderna de gestión de ventas e inventario diseñada para optimizar las operaciones comerciales. La plataforma ofrece:

- ✅ Sistema de Punto de Venta (POS) intuitivo
- ✅ Gestión completa de inventario con seguimiento de lotes
- ✅ Control de fechas de vencimiento
- ✅ Sistema de permisos basado en roles (RBAC)
- ✅ Interfaz moderna con modo claro/oscuro
- ✅ Alertas de riesgo de pérdida de inventario

---

## Requisitos del Sistema

Para utilizar Unity Sales de manera óptima, necesitas:

| Componente | Requisito Mínimo |
|------------|------------------|
| **Navegador** | Google Chrome, Firefox, Safari o Edge (versiones actualizadas) |
| **Conexión a Internet** | Banda ancha estable |
| **Pantalla** | Resolución mínima de 1024x768 píxeles |
| **JavaScript** | Habilitado en el navegador |

---

## Acceso al Sistema

### Iniciar Sesión

1. Abre tu navegador web y accede a la URL de Unity Sales.
2. Se mostrará la pantalla de **System Access** (Acceso al Sistema).

![Login](docs/login-screen.png)

3. Ingresa tus credenciales:
   - **Terminal Email**: Tu correo electrónico de usuario registrado.
   - **Encrypted Key**: Tu contraseña asignada.

4. Haz clic en el botón **"Initialize Session"** para acceder.

> ⚠️ **Importante**: Si ves el mensaje "Invalid credentials. Access denied.", verifica que tu correo y contraseña sean correctos. Después de varios intentos fallidos, tu cuenta podría bloquearse temporalmente.

### Cerrar Sesión

1. Haz clic en tu avatar de usuario en la esquina superior derecha.
2. Selecciona **"Cerrar Sesión"** del menú desplegable.
3. Serás redirigido a la página de inicio de sesión.

---

## Panel Principal (Dashboard)

Después de iniciar sesión, accederás al **Dashboard** principal de Unity Sales.

### Elementos de la Interfaz Principal

| Elemento | Descripción |
|----------|-------------|
| **Barra Lateral (Sidebar)** | Menú de navegación principal. Se puede expandir/contraer. |
| **Encabezado (Header)** | Muestra la versión de la app, botón de tema y perfil de usuario. |
| **Área de Contenido** | Zona central donde se muestran los módulos y funcionalidades. |

### Barra Lateral

La barra lateral izquierda contiene todos los módulos disponibles según tus permisos:

- **Contraer/Expandir**: Haz clic en el ícono de menú (☰) para alternar entre la vista compacta y expandida.
- **Navegación**: Haz clic en cualquier ítem del menú para acceder al módulo correspondiente.
- **Submenús**: Algunos elementos tienen submenús que se despliegan al hacer clic.

---

## Módulo de Ventas

El módulo de ventas es el corazón de Unity Sales, proporcionando un sistema de punto de venta moderno y eficiente.

### Acceder al Módulo de Ventas

1. En la barra lateral, haz clic en **"Ventas"** o **"Sales"**.

### Interfaz del Punto de Venta

La pantalla se divide en dos secciones principales:

#### Panel Izquierdo - Catálogo de Productos

- **Barra de Búsqueda**: Escribe el nombre del producto para filtrar la lista.
- **Tarjetas de Productos**: Cada tarjeta muestra:
  - Nombre del producto
  - Precio unitario (en color destacado)
  - Stock disponible

#### Panel Derecho - Carrito de Compra

- **Lista de Productos**: Productos añadidos a la venta actual.
- **Controles de Cantidad**: Botones (+) y (-) para ajustar cantidades.
- **Eliminar Producto**: Botón de papelera para quitar un producto.
- **Total**: Suma total de la venta en curso.
- **Botón "Complete Transaction"**: Finaliza la venta.

### Realizar una Venta

1. **Buscar Producto**: Utiliza la barra de búsqueda o navega por la lista.
2. **Agregar al Carrito**: Haz clic en el producto deseado (botón +).
3. **Ajustar Cantidad**: 
   - Usa los botones (+) y (-) en el carrito.
   - El sistema no permitirá exceder el stock disponible.
4. **Eliminar Producto**: Haz clic en el ícono de papelera (🗑️) si deseas remover un ítem.
5. **Completar Venta**: 
   - Revisa el total.
   - Haz clic en **"Complete Transaction"**.
   - Recibirás una confirmación con el ID de la transacción.

> 💡 **Consejo**: Los productos sin stock aparecerán deshabilitados y no podrán agregarse al carrito.

---

## Módulo de Inventario

El módulo de inventario permite gestionar todos los productos y lotes de tu negocio.

### Gestión de Productos

#### Acceder a Productos

1. En la barra lateral, navega a **Inventario → Productos** (o **Inventory → Products**).

#### Panel de Indicadores (KPIs)

Al ingresar, verás tarjetas informativas:

| Indicador | Descripción |
|-----------|-------------|
| **Loss Risk** | Cantidad de productos en riesgo de pérdida (bajo stock o expirados) |
| **AI Suggestion** | Sugerencias automáticas basadas en el estado del inventario |

#### Tabla de Productos

La tabla muestra todos los productos con las siguientes columnas:

| Columna | Descripción |
|---------|-------------|
| **Product / Batch** | Nombre del producto y código SKU |
| **Category** | Categoría del producto |
| **On Hand** | Cantidad en stock (solo productos físicos) |
| **Unit Price** | Precio unitario |
| **Expiration Date** | Fecha de vencimiento (si aplica) |
| **Actions** | Botones para editar o eliminar |
| **Risk Status** | Estado de riesgo del producto |

##### Estados de Riesgo

| Estado | Significado |
|--------|-------------|
| 🟢 **OPTIMAL** | Inventario en niveles saludables |
| 🟡 **LOW STOCK** | Stock por debajo del mínimo |
| 🟠 **NEAR EXPIRY** | Próximo a vencer (menos de 30 días) |
| 🔴 **OUT OF STOCK** | Sin existencias |
| 🔴 **EXPIRED** | Producto vencido |

#### Buscar Productos

1. Utiliza la barra de búsqueda en la parte superior de la tabla.
2. Escribe el nombre del producto o código SKU.
3. La tabla se filtrará automáticamente.

#### Paginación

- Usa los botones **◀ ▶** para navegar entre páginas.
- Se muestra el número de página actual y el total de páginas.

#### Agregar Nuevo Producto

1. Haz clic en el botón **"Add New Product"** (esquina superior derecha).
2. Completa el formulario:
   - **Nombre del Producto** (obligatorio)
   - **SKU** (código único)
   - **Categoría**
   - **Tipo** (físico o digital)
   - **Precio Base**
   - **Stock Inicial** (solo productos físicos)
   - **Stock Mínimo** (nivel de alerta)
   - **Fecha de Vencimiento** (opcional)
3. Haz clic en **"Guardar"** para crear el producto.

#### Editar Producto

1. En la fila del producto, haz clic en el ícono de lápiz (✏️).
2. Modifica los campos necesarios en el formulario.
3. Haz clic en **"Guardar Cambios"** para aplicar.

#### Eliminar Producto

1. En la fila del producto, haz clic en el ícono de papelera (🗑️).
2. Confirma la eliminación en el diálogo de confirmación.

> ⚠️ **Advertencia**: La eliminación de productos es irreversible.

---

### Gestión de Lotes

Los lotes permiten gestionar diferentes entregas de un mismo producto, cada una con su propia fecha de vencimiento y costo.

#### Acceder a Lotes

1. En la barra lateral, navega a **Inventario → Lotes** (o **Inventory → Batches**).

#### Panel de Indicadores

| Indicador | Descripción |
|-----------|-------------|
| **Expiry Risk** | Número de lotes próximos a vencer o expirados |
| **Total Batches** | Total de lotes activos en el sistema |

#### Tabla de Lotes

| Columna | Descripción |
|---------|-------------|
| **Batch Number** | Número identificador del lote |
| **Product** | Producto al que pertenece el lote |
| **Stock** | Unidades disponibles en el lote |
| **Cost / Unit** | Costo por unidad del lote |
| **Received / Expiry** | Fechas de recepción y vencimiento |
| **Status** | Estado del lote |
| **Actions** | Botón para eliminar |

##### Estados de Lotes

| Estado | Significado |
|--------|-------------|
| 🟢 **ACTIVE** | Lote activo y disponible |
| 🟡 **NEAR EXPIRY** | Próximo a vencer |
| 🔴 **EXPIRED** | Lote vencido |
| ⚪ **EMPTY** | Lote sin stock |

#### Agregar Nuevo Lote

1. Haz clic en el botón **"Add New Batch"**.
2. Completa el formulario:
   - **Producto**: Selecciona el producto asociado (solo productos físicos).
   - **Número de Lote**: Identificador único del lote.
   - **Cantidad**: Número de unidades.
   - **Costo por Unidad**: Precio de compra.
   - **Fecha de Recepción**: Cuándo recibiste el lote.
   - **Fecha de Vencimiento**: Cuándo expira (opcional).
3. Haz clic en **"Guardar"** para crear el lote.

> 💡 **Consejo**: El stock del producto se actualizará automáticamente al crear un nuevo lote.

---

## Perfil de Usuario

La sección de perfil muestra tu información personal y de cuenta.

### Acceder al Perfil

1. Haz clic en tu avatar de usuario en el encabezado.
2. Selecciona **"Mi Perfil"** del menú desplegable.

### Información Mostrada

La página de perfil muestra:

| Campo | Descripción |
|-------|-------------|
| **Avatar** | Iniciales del usuario |
| **Nombre Completo** | Tu nombre registrado |
| **Rol** | Tu rol en el sistema |
| **Descripción** | Información adicional del perfil |
| **Correo Electrónico** | Email de la cuenta |
| **ID de Usuario** | Identificador único |
| **Miembro Desde** | Fecha de creación de la cuenta |
| **Rango de Seguridad** | Nivel de acceso |
| **Último Inicio de Sesión** | Fecha y hora del último acceso |

---

## Módulo de Administración

El módulo de administración está disponible únicamente para usuarios con permisos de administrador.

### Gestión de Navegación

Este módulo permite configurar los elementos del menú de navegación.

#### Acceder a Gestión de Navegación

1. En la barra lateral, navega a **Admin → Navegación** (o **Admin → Navigation**).

#### Interfaz

La pantalla se divide en:

- **Panel Izquierdo**: Lista de elementos de navegación existentes (vista en árbol).
- **Panel Derecho**: Formulario para crear/editar elementos.

#### Crear Nuevo Elemento de Menú

1. En el panel derecho, completa los campos:
   - **Etiqueta**: Nombre visible del menú.
   - **Sección**: main, ai o settings.
   - **Ruta (HREF)**: URL del destino (ej: `/inventory/products`).
   - **Active Path Pattern**: Patrón para marcar como activo.
   - **Icon Name**: Nombre del ícono de Lucide (ej: Package, Users).
   - **Padre**: Si es un submenú, selecciona el elemento padre.
   - **Rol Requerido**: Rol necesario para ver este elemento.
   - **Orden**: Posición en el menú.
   - **Is Active**: Si el elemento está activo o no.

2. Haz clic en **"Crear Nodo"**.

#### Editar Elemento

1. En la lista izquierda, haz clic en el ícono de lápiz (✏️) del elemento.
2. El formulario se llenará con los datos actuales.
3. Modifica los campos necesarios.
4. Haz clic en **"Guardar Cambios"**.

#### Eliminar Elemento

1. Haz clic en el ícono de papelera (🗑️) del elemento.
2. Confirma la eliminación.

> ⚠️ **Nota**: Al eliminar un elemento padre, los hijos quedarán huérfanos.

---

### Gestión de Permisos (RBAC)

El sistema RBAC (Control de Acceso Basado en Roles) permite definir qué roles pueden acceder a qué secciones de la aplicación.

#### Acceder a Gestión de Permisos

1. En la barra lateral, navega a **Admin → Permisos** (o **Admin → Permissions**).

#### Interfaz de Matriz de Permisos

La pantalla muestra una tabla con:

- **Filas**: Elementos de navegación (menús).
- **Columnas**: Roles del sistema.
- **Casillas**: Estado del permiso (habilitado/deshabilitado).

#### Iconos de Permisos

| Ícono | Significado |
|-------|-------------|
| 🛡️ **ShieldCheck** (azul/marca) | Permiso concedido |
| 🛡️ **ShieldAlert** (gris) | Permiso denegado |

#### Modificar Permisos

1. Localiza el cruce entre el menú y el rol deseado.
2. Haz clic en el ícono del escudo.
3. El permiso se invertirá automáticamente:
   - Si estaba habilitado → Se deshabilita.
   - Si estaba deshabilitado → Se habilita.
4. Los cambios se guardan automáticamente.

#### Buscar Elementos

1. Usa la barra de búsqueda para filtrar por nombre o ruta del menú.
2. La tabla se actualizará mostrando solo los resultados coincidentes.

#### Paginación

- Se muestran 8 elementos por página.
- Usa los botones de navegación para moverte entre páginas.

> 💡 **Consejo**: Los cambios de permisos se aplican inmediatamente. Los usuarios afectados verán los cambios al recargar la página o en su próximo inicio de sesión.

---

## Interfaz y Navegación

### Tema Claro/Oscuro

Unity Sales incluye soporte para modo oscuro y claro:

1. Haz clic en el ícono de sol (☀️) o luna (🌙) en el encabezado.
2. El tema cambiará inmediatamente.
3. Tu preferencia se guardará para futuras sesiones.

### Notificaciones

El sistema muestra notificaciones en la esquina superior derecha para informarte sobre:

- ✅ Operaciones exitosas
- ❌ Errores
- ⚠️ Advertencias

### Navegación Rápida

| Atajo | Acción |
|-------|--------|
| Clic en logo | Ir al Dashboard |
| Avatar → Mi Perfil | Ir a configuración de perfil |
| Avatar → Cerrar Sesión | Terminar sesión |

### Responsive

Unity Sales está optimizado para diferentes tamaños de pantalla:

- **Desktop**: Vista completa con barra lateral expandida.
- **Tablet**: Barra lateral contraída, interfaz adaptada.
- **Móvil**: Diseño de columna única (en desarrollo).

---

## Preguntas Frecuentes

### ¿Olvidé mi contraseña?

Contacta al administrador del sistema para restablecer tu contraseña.

### ¿Por qué no veo ciertos módulos?

Tu acceso está limitado según tu rol. Contacta al administrador si necesitas permisos adicionales.

### ¿Cómo agrego stock a un producto existente?

Crea un nuevo lote para el producto. El stock del producto se actualizará automáticamente.

### ¿Puedo deshacer una venta?

Actualmente, las ventas completadas no pueden revertirse desde la interfaz. Contacta al administrador.

### ¿Qué significan los colores de estado?

| Color | Significado |
|-------|-------------|
| 🟢 Verde | Estado óptimo |
| 🟡 Amarillo/Naranja | Requiere atención |
| 🔴 Rojo | Estado crítico |
| ⚪ Gris | Neutral/vacío |

### ¿Cómo exporto datos?

Esta funcionalidad estará disponible en futuras versiones.

---

## Soporte

Si tienes problemas técnicos o preguntas adicionales:

1. Contacta al administrador del sistema.
2. Revisa que tu navegador esté actualizado.
3. Limpia la caché del navegador si experimentas problemas de visualización.

---

**Unity Sales v1.0** - Sistema de Gestión de Ventas e Inventario

*© 2024 - Todos los derechos reservados*
