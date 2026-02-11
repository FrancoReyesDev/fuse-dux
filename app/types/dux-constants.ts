import type {
  CategoriaFiscal,
  TipoCompCrear,
  TipoEntrega,
} from "./dux-dto/post-factura-dto";

export const CATEGORIA_FISCAL_OPTIONS: CategoriaFiscal[] = [
  "CONSUMIDOR_FINAL",
  "RESPONSABLE_INSCRIPTO",
  "EXENTO",
  "MONOTRIBUTISTA",
];

export const TIPO_ENTREGA_OPTIONS: TipoEntrega[] = [
  "ENTREGA_INMEDIATA",
  "NO_ENTREGA",
];

export const TIPO_COMP_OPTIONS: TipoCompCrear[] = [
  "COMPROBANTE_VENTA",
  "FACTURA",
];
