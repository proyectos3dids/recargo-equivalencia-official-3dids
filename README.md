# Sistema de Recargo Equivalencia para Shopify

## Descripción

Este sistema automatiza la gestión del recargo de equivalencia para clientes específicos en tiendas Shopify. Detecta automáticamente si un cliente tiene la etiqueta "RE" y añade o elimina el producto de recargo según corresponda.

## Características

- ✅ Detección automática de clientes con etiqueta "RE"
- ✅ Añade automáticamente el producto de recargo al carrito
- ✅ Elimina el recargo cuando el cliente no está logueado o no tiene la etiqueta
- ✅ Intercepta botones de checkout para validaciones adicionales
- ✅ Compatible con cart drawer, página de carrito y notificaciones


## Archivos Modificados

Este sistema requiere modificaciones en los siguientes archivos:

### 1. Snippet Principal
- **Archivo**: `snippets/recargo-equivalencia-3dids.liquid`
- **Descripción**: Contiene toda la lógica del sistema de recargo

### 2. Layout Principal
- **Archivo**: `layout/theme.liquid`
- **Modificación**: Añadir el render del snippet antes del cierre del `</body>`

### 3. Configuración del Tema
- **Archivo**: `config/settings_schema.json`
- **Modificación**: Añadir configuración para seleccionar el producto de recargo

## Instalación

### Paso 1: Crear el Snippet

1. Crea el archivo `snippets/recargo-equivalencia-3dids.liquid` con el contenido del sistema
2. El snippet ya incluye toda la lógica necesaria para:
   - Detectar clientes con etiqueta "RE"
   - Gestionar atributos del carrito
   - Añadir/eliminar productos automáticamente
   - Interceptar botones de checkout

### Paso 2: Modificar el Layout

En `layout/theme.liquid`, añade antes del cierre de `</body>`:

```liquid
{% render 'recargo-equivalencia-3dids' %}
```

### Paso 3: Configurar el Producto de Recargo

En `config/settings_schema.json`, añade esta configuración:

```json
{
  "name": "theme_info",
  "theme_name": "Tu Tema",
  "theme_version": "1.0.0",
  "theme_author": "Tu Nombre",
  "theme_documentation_url": "",
  "theme_support_url": ""
},
{
  "name": "Recargo Equivalencia",
  "settings": [
    {
      "type": "product",
      "id": "recargo_equivalencia_product",
      "label": "Producto de Recargo Equivalencia",
      "info": "Selecciona el producto que se añadirá automáticamente para clientes con etiqueta RE"
    }
  ]
}
```

### Paso 4: Crear el Producto de Recargo

1. Ve a **Productos** en tu admin de Shopify
2. Crea un nuevo producto con:
   - **Título**: "Recargo de Equivalencia" (o el nombre que prefieras)
   - **Precio**: 0€ (el precio real se calculará dinámicamente por el script)
   - **Visible**: No (para que no aparezca en la tienda)
   - **Impuestos**: Desmarcar "Este producto está sujeto a impuestos"
   - **Inventario**: Desmarcar "Hacer seguimiento de la cantidad"
   - **IMPORTANTE**: En la sección SEO, configura el campo `hidden` con valor `1` para que el producto no aparezca en buscadores ni en el sitio web

### Paso 5: Configurar el Tema

1. Ve a **Temas** > **Personalizar**
2. En **Configuración del tema** > **Recargo Equivalencia**
3. Selecciona el producto de recargo creado en el paso anterior
4. Guarda los cambios

### Paso 6: Configurar Clientes

Para que un cliente tenga recargo automático:

1. Ve a **Clientes** en tu admin
2. Edita el cliente correspondiente
3. En **Etiquetas**, añade: `RE`
4. Guarda los cambios

## Funcionamiento

### Para Clientes con Etiqueta "RE"

1. **Al cargar la página**: El sistema detecta la etiqueta "RE"
2. **Atributos del carrito**: Se establecen `cliente_RE: true` y `recargo_variant_id`
3. **Producto de recargo**: Se añade automáticamente al carrito si no está presente
4. **Checkout**: El recargo se incluye en el pedido

### Para Clientes sin Etiqueta o No Logueados

1. **Limpieza automática**: Se eliminan los atributos `cliente_RE` y `recargo_variant_id`
2. **Eliminación del producto**: Se quita el producto de recargo del carrito
3. **Checkout normal**: Sin recargo adicional



## Personalización

### Cambiar el Nombre de la Etiqueta

En el snippet, busca:

```liquid
{% if tag_lowercase == 're' %}
```

Y cambia `'re'` por la etiqueta que prefieras.



### Añadir Validaciones Adicionales

Puedes añadir más condiciones en la sección de detección de clientes:

```liquid
{% if customer and customer.tags contains 'RE' and customer.orders_count > 0 %}
  <!-- Lógica adicional -->
{% endif %}
```

## Compatibilidad

- ✅ **Shopify Dawn Theme** (probado)
- ✅ **Temas basados en Dawn**
- ✅ **Cart Drawer**
- ✅ **Página de Carrito**
- ✅ **Ajax Cart**
- ⚠️ **Otros temas**: Puede requerir ajustes menores

### Adaptación a otros temas

**IMPORTANTE**: Si vas a implementar este sistema en un tema diferente a Dawn, debes adaptar los eventos y selectores del snippet según la estructura específica de tu tema:

1. **Eventos PUB_SUB**: Verifica que tu tema utilice el mismo sistema de eventos (`PUB_SUB_EVENTS.cartUpdate`) o adapta el código para usar los eventos específicos de tu tema.

2. **Selectores de elementos**: Los siguientes selectores pueden necesitar modificación según tu tema:
   - `cart-items` - Elemento del carrito principal
   - `cart-drawer-items` - Elemento del cajón del carrito
   - Selectores de botones de checkout específicos de tu tema

3. **Estructura del carrito**: Asegúrate de que tu tema maneje el carrito de manera similar (usando `/cart/add.js`, `/cart/change.js`, etc.)

4. **Funciones de actualización**: Verifica que las funciones `onCartUpdate()` existan en los elementos del carrito de tu tema o adapta el código según corresponda.

### Modificaciones adicionales requeridas

Para que el snippet funcione correctamente, es necesario agregar código de verificación en los archivos del carrito del tema. **IMPORTANTE**: En lugar de añadir código independiente, debes integrar la verificación en los bucles existentes de `cart.items`.

#### 1. Archivo principal del carrito (ej: `sections/main-cart-items.liquid`)

**Busca el bucle existente** que recorre `cart.items` (generalmente algo como `{% for item in cart.items %}`) y **modifica la lógica** para incluir la verificación del producto de recargo:

```liquid
{%- comment -%} Inicializar variable antes del bucle existente {%- endcomment -%}
{%- assign product_in_cart = false -%}

{%- for item in cart.items -%}
  {%- comment -%} Verificar si es el producto de recargo equivalencia - solo asignar si aún no se ha encontrado {%- endcomment -%}
  {%- unless product_in_cart -%}
    {%- if settings.recargo_equivalencia_product != blank and item.product.id == settings.recargo_equivalencia_product.id -%}
      {%- assign product_in_cart = true -%}
    {%- endif -%}
  {%- endunless -%}
  
  {%- comment -%} Aquí continúa el código existente del bucle para mostrar cada item {%- endcomment -%}
  <!-- El resto del código existente del item -->
{%- endfor -%}

{%- comment -%} Añadir después del bucle {%- endcomment -%}
{%- if product_in_cart -%}
  <input type="hidden" id="cart-product-check" data-product-in-cart="true" />
{%- else -%}
  <input type="hidden" id="cart-product-check" data-product-in-cart="false" />
{%- endif -%}
```

#### 2. Archivo del drawer/cajón del carrito (ej: `snippets/cart-drawer.liquid`)

**Busca el bucle existente** de `cart.items` en el drawer y aplica la misma modificación:

```liquid
{%- comment -%} Inicializar variable antes del bucle existente del drawer {%- endcomment -%}
{%- assign drawer_product_in_cart = false -%}

{%- for item in cart.items -%}
  {%- comment -%} Verificar si es el producto de recargo equivalencia - solo asignar si aún no se ha encontrado {%- endcomment -%}
  {%- unless drawer_product_in_cart -%}
    {%- if settings.recargo_equivalencia_product != blank and item.product.id == settings.recargo_equivalencia_product.id -%}
      {%- assign drawer_product_in_cart = true -%}
    {%- endif -%}
  {%- endunless -%}
  
  {%- comment -%} Aquí continúa el código existente del bucle del drawer {%- endcomment -%}
  <!-- El resto del código existente del item del drawer -->
{%- endfor -%}

{%- comment -%} Añadir después del bucle del drawer {%- endcomment -%}
{%- if drawer_product_in_cart -%}
  <input type="hidden" id="cart-product-check" data-product-in-cart="true" />
{%- else -%}
  <input type="hidden" id="cart-product-check" data-product-in-cart="false" />
{%- endif -%}
```

**Pasos para implementar:**

1. **Localiza los archivos**: Busca los archivos que manejan la visualización del carrito principal y el drawer lateral en tu tema específico
2. **Encuentra los bucles**: Identifica dónde se hace `{% for item in cart.items %}` en cada archivo
3. **Integra la verificación**: Añade la lógica de verificación **dentro** del bucle existente, no como código separado
4. **Añade el input hidden**: Coloca el elemento `<input type="hidden" id="cart-product-check">` **después** del bucle correspondiente

**Nota**: Los nombres de archivo pueden variar según el tema utilizado. La clave es encontrar dónde se renderizan los items del carrito y modificar esos bucles específicos.

## Solución de Problemas

### El recargo no se añade automáticamente

1. Verifica que el cliente tenga la etiqueta "RE"
2. Comprueba que el producto de recargo esté configurado en el tema
3. Verifica que el producto de recargo esté disponible

### El recargo no se elimina

1. Verifica que el snippet esté incluido en `theme.liquid`
2. Asegúrate de que el producto de recargo esté configurado correctamente

### Problemas con el checkout

1. Asegúrate de que el producto de recargo tenga inventario suficiente
2. Verifica que el producto no esté archivado

## Créditos

- **Desarrollado por**: David Ávila
- **Empresa**: 3dids.com
- **Contacto**: info@3dids.com
- **Versión**: 1.0.0
- **Fecha**: 2025

## Licencia

© 2025 3dids.com - Todos los derechos reservados

---

**Nota**: Este sistema ha sido desarrollado específicamente para gestionar recargos de equivalencia de forma automática. Para soporte técnico o personalizaciones adicionales, contacta con info@3dids.com