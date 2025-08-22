import React, { useState } from "react";
import {
  reactExtension,
  useCustomer,
  useCost,
  useApi,
  Banner,
  BlockStack,
  Checkbox,
  Text,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension("purchase.checkout.block.render", () => <RecargoEquivalencia />);

function RecargoEquivalencia() {
  const customer = useCustomer();
  const cost = useCost();
  const { i18n } = useApi();
  const [checked, setChecked] = useState(false);

  // Lee el metafield custom.b2b del cliente
  const isB2B = customer?.metafield({ namespace: "custom", key: "b2b" })?.value === "true";
  if (!isB2B) return null;

  // Obtiene el subtotal real del checkout (con IVA)
  const subtotalConIVA = parseFloat(cost?.subtotalAmount?.amount || "0");
  const currencyCode = cost?.subtotalAmount?.currencyCode || "EUR";
  const ivaRate = 0.21; // Cambia según tu caso

  // Calcula el subtotal sin IVA
  const subtotalSinIVA = subtotalConIVA / (1 + ivaRate);

  // Calcula el recargo (5,2%)
  const recargo = Math.round(subtotalSinIVA * 0.052 * 100) / 100;

  // Formatea la moneda
  const formattedRecargo = i18n.formatCurrency(recargo, { currency: currencyCode });
  const formattedTotal = i18n.formatCurrency(subtotalConIVA + (checked ? recargo : 0), { currency: currencyCode });

  return (
    <BlockStack spacing="loose">
      <Checkbox
        checked={checked}
        onChange={setChecked}
        id="recargo-equivalencia"
      >
        Recargo de equivalencia (5,2%)
      </Checkbox>
      {checked && (
        <Banner title="Resumen con recargo de equivalencia">
          <Text>
            Subtotal sin IVA: {i18n.formatCurrency(subtotalSinIVA, { currency: currencyCode })}
            <br />
            Recargo de equivalencia (5,2%): <strong>{formattedRecargo}</strong>
            <br />
            <strong>Total informativo: {formattedTotal}</strong>
          </Text>
        </Banner>
      )}
    </BlockStack>
  );
}