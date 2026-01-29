import type { ProductCsvRow } from "~/types/product-csv-row";

interface Params {
  producto: string;
  credito3Pagos: string;
  credDebQr: string;
  efTrans: string;
}

export function genCopyText({
  producto,
  credito3Pagos,
  credDebQr,
  efTrans,
}: Params) {
  const text = `*\`${producto}\`* 
  
\`$${credito3Pagos}\` *PRECIO LISTA 3 CUOTAS SIN INTERES*
\`$${credDebQr}\` con *TARJETA DE CREDITO EN 1 PAGO o DEBITO*. 💳 
\`$${efTrans}\` en *EFECTIVO o TRANSFERENCIA BANCARIA* 💵

*Precios sujetos a cambio sin previo aviso*`;
  return text;
}
