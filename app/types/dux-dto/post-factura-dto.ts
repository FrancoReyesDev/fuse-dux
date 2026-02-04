// dux-crear-factura.dto.ts

export type CategoriaFiscal =
  | "CONSUMIDOR_FINAL"
  | "RESPONSABLE_INSCRIPTO"
  | "EXENTO"
  | "MONOTRIBUTISTA"
  | string;

export type TipoEntrega = "ENTREGA_INMEDIATA" | "NO_ENTREGA" | string;

export type TipoCompCrear = "COMPROBANTE_VENTA" | "FACTURA" | string;

export type TipoDoc = "DNI" | "CUIT" | string;

export interface DuxCrearFacturaRequestDTO {
  // required
  fecha_comprobante: string; // ddMMyyyy
  categoria_fiscal: CategoriaFiscal;
  apellido_razon_soc: string;

  id_empresa: number;
  id_sucursal_empresa: number;
  nro_pto_vta: string; // punto de venta (electrónico si AFIP)
  id_personal: number;
  id_deposito: number;

  productos: DuxCrearFacturaProductoDTO[];

  tipo_entrega: TipoEntrega;
  tipo_comp: TipoCompCrear;

  // optional
  percepciones?: DuxCrearFacturaPercepcionDTO[];

  tipo_doc?: TipoDoc;
  nro_doc?: number;

  email_cliente?: string;
}

export interface DuxCrearFacturaProductoDTO {
  cod_item: string;
  id_det_item?: number; // variante (según corresponda)
  ctd: number; // double
  porc_desc: number | string; // en spec figura string, en ejemplo mandan 0
  precio_uni: number; // double
}

export interface DuxCrearFacturaPercepcionDTO {
  id_percepcion_impuesto: number;
  importe: number; // double
  observaciones?: string;
}

export interface DuxCrearFacturaResponseDTO {
  estado: string; // "Peticion ingresada con exito"
  id_proceso: number; // ej 13
}
