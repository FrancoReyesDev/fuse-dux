export interface ProductCsvRow {
  codigo: string;
  producto: string;

  precios: {
    efTrans: string; // number
    credDebQr: string; // number
    credito3Pagos: string; // number
    credito6Cuotas: string; // number
    hotSale: string; // number
    mayorista: string; // number
    meli: string; // number
    meli12Cuotas: string; // number
    meli3Cuotas: string; // number
    meli6Cuotas: string; // number
    meli9Cuotas: string; // number
    meliBajoInteres: string; // number
  };

  stock: {
    depositoHowler: string; // number
    depositoSanJose: string; // number
    full: string; // number
    localSanJuan: string; // number
  };

  codigoBarra?: string;
  rubro?: string;
  subRubro?: string;
  marca?: string;
  descripcion?: string;
  talle?: string;
  color?: string;
  unidad?: string;
  observaciones?: string;
}
