import type { ProductCsvRow } from "~/types/product-csv-row";

export function mapProductCsvRow(row: string[]): ProductCsvRow {
  return {
    codigo: row[0],
    producto: row[1],

    precios: {
      efTrans: row[2],
      credDebQr: row[3],
      credito3Pagos: row[4],
      credito6Cuotas: row[5],
      hotSale: row[6],
      mayorista: row[7],
      meli: row[8],
      meli12Cuotas: row[9],
      meli3Cuotas: row[10],
      meli6Cuotas: row[11],
      meli9Cuotas: row[12],
      meliBajoInteres: row[13],
    },

    stock: {
      depositoHowler: row[14],
      depositoSanJose: row[15],
      full: row[16],
      localSanJuan: row[17],
    },

    codigoBarra: row[18] || undefined,
    rubro: row[19] || undefined,
    subRubro: row[20] || undefined,
    marca: row[21] || undefined,
    descripcion: row[22] || undefined,
    talle: row[23] || undefined,
    color: row[24] || undefined,
    unidad: row[25] || undefined,
    observaciones: row[26] || undefined,
  };
}
