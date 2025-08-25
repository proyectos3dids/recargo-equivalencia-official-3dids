import {
  reactExtension,
  Banner,
  useCartLines,
  Text,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => <App />);

function App() {
  const cartLines = useCartLines();

  const recargoLine = cartLines.find(line =>
    typeof line.merchandise?.title === "string" &&
    line.merchandise.title.toLowerCase().includes("recargo de equivalencia")
  );

  if (!recargoLine) return null;

  // Verificar si el precio del recargo es mayor a 0
  const recargoPrice = parseFloat(recargoLine.cost?.totalAmount?.amount || 0);
  
  if (recargoPrice === 0) {
    return (
      <Banner status="critical" title="Error en Recargo de equivalencia">
        <Text>
          Actualmente, tienes régimen de Recargo de equivalencia, pero por algún motivo, no se ha aplicado correctamente en el carrito. 
          Por favor, vuelve atrás, haz algún cambio en el carrito (como cambiar las unidades de producto) y vuelve a pulsar el botón de Finalizar compra. 
          Si el problema persiste, contacta con nosotros.
        </Text>
      </Banner>
    );
  }

  return (
    <Banner status="info" title="Recargo de equivalencia">
      <Text>Estamos aplicando correctamente el Recargo de equivalencia del 5,2%</Text>
    </Banner>
  );
}