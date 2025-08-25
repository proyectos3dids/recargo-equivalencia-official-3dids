import type { RunInput, CartTransformRunResult, Operation } from "../generated/api";

export function cartTransformRun(input: RunInput): CartTransformRunResult {
  // Calcular el subtotal del carrito sumando los precios de cada línea (con IVA incluido)
  const subtotalConIVA = input.cart.lines.reduce(
    (sum, line) => sum + Number(line.cost.amountPerQuantity.amount) * line.quantity,
    0
  );
  
  // Calcular el subtotal sin IVA (asumiendo IVA del 21%)
  const IVA = 0.21;
  const subtotalSinIVA = subtotalConIVA / (1 + IVA);
  
  // Calcular el 5.2% del subtotal sin IVA
  const newUnitPrice = Number((subtotalSinIVA * 0.052).toFixed(2));

  // Buscar la línea que contenga "Recargo de equivalencia" en el título del producto
  const targetLine = input.cart.lines.find(
    line =>
      line.merchandise?.__typename === "ProductVariant" &&
      line.merchandise.product?.title?.toLowerCase().includes("recargo de equivalencia")
  );

  // Si la línea existe, crear la operación para esa línea
  const operations: Operation[] = [];
  
  if (targetLine) {
    // Operación para actualizar el precio
    operations.push({
      lineUpdate: {
        cartLineId: targetLine.id,
        price: {
          adjustment: {
            fixedPricePerUnit: {
              amount: newUnitPrice,
            },
          },
        },
        title: undefined,
        image: undefined,
      },
    });
    
    // NOTA: Cart Transform API no permite modificar la cantidad de líneas del carrito
    // Solo se puede actualizar: cartLineId, title, price, image
    // Para controlar cantidades, se necesitaría usar otra API como Storefront API
  }

  // Devolver las operaciones
  return { 
    operations
  };
}