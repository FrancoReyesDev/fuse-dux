// post-factura-dto.ts

export type CategoriaFiscal =
  | "CONSUMIDOR_FINAL"
  | "RESPONSABLE_INSCRIPTO"
  | "EXENTO"
  | "MONOTRIBUTISTA";

export type TipoEntrega = "ENTREGA_INMEDIATA" | "NO_ENTREGA";

export type TipoCompCrear = "COMPROBANTE_VENTA" | "FACTURA";

export type TipoDoc = "DNI" | "CUIT";

export interface DuxCrearFacturaRequestDTO {
  // Las propiedades requeridas según OpenAPI
  fecha_comprobante: string; // Formato: ddMMyyyy
  categoria_fiscal: CategoriaFiscal;
  apellido_razon_soc: string;
  id_empresa: number;
  id_sucursal_empresa: number;
  nro_pto_vta: string;
  id_personal: number;
  id_deposito: number;
  productos: DuxCrearFacturaProductoDTO[];
  tipo_entrega: TipoEntrega;
  tipo_comp: TipoCompCrear;

  // Propiedades opcionales
  percepciones?: DuxCrearFacturaPercepcionDTO[];
  tipo_doc?: TipoDoc;
  nro_doc?: number;
  email_cliente?: string;
}

export interface DuxCrearFacturaProductoDTO {
  cod_item: string;
  ctd: number;
  porc_desc: string | number; // Schema dice string, ejemplo dice number. Soportamos ambos.
  precio_uni: number;
  id_det_item?: number; // Identificador de variante opcional
}

export interface DuxCrearFacturaPercepcionDTO {
  id_percepcion_impuesto: number;
  importe: number;
  observaciones?: string;
}

export interface DuxCrearFacturaResponseDTO {
  estado: string; // "Peticion ingresada con exito"
  id_proceso: number;
}
