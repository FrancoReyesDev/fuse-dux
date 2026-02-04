// dux-facturas.dto.ts

export type TipoComp =
  | "FACTURA"
  | "COMPROBANTE_VENTA"
  | "FACTURA_FCE_MIPYMES"
  | "NOTA_CREDITO"
  | "NOTA_CREDITO_FCE_MI_PYMES"
  | "NOTA_DEBITO"
  | "NOTA_DEBITO_FCE_MI_PYMES"
  | string;

export type LetraComp = "A" | "B" | "C" | "X" | string;

export interface ConsultarFacturasQueryDTO {
  fechaDesde: string; // yyyy-MM-dd
  fechaHasta: string; // yyyy-MM-dd  (ojo: en tu default hay un formato mal)
  idEmpresa: number;
  idSucursal: number;

  idCompVenta?: number;
  tipoComp?: TipoComp;
  nroComp?: number;
  letraComp?: LetraComp;
  puntoVenta?: number;

  cliente?: string;
  cuit?: string;
  nroDoc?: number;
  nroPedido?: number;

  conCobro?: boolean;
  anuladas?: boolean;

  offset?: number; // default 0
  limit?: number; // default 20 (max 50)
}

export type NumberLike = number | string;

export interface DuxFacturasResponseDTO {
  paging: {
    total: number;
    offset: number | null;
    limit: number;
  };
  results: DuxFacturaDTO[];
}

export interface DuxFacturaDTO {
  id: number;
  id_cliente: number;
  id_empresa: number;

  nro_pto_vta: string; // viene string ("22114", "1")
  id_personal: number;

  nro_doc: number | null;

  tipo_comp: TipoComp;
  letra_comp: LetraComp;
  nro_comp: number;

  fecha_comp: string; // ej "Dec 14, 2023 3:00:00 AM"

  nro_pedido: number | null;
  referencia_pedido: string | null;

  monto_exento: NumberLike;
  monto_gravado: NumberLike;
  monto_iva: NumberLike;
  monto_desc: NumberLike;
  monto_percepcion_impuesto: NumberLike;

  total: NumberLike;

  apellido_razon_soc: string;
  nombre: string;
  cuit: string | null;

  nro_cae_cai: string | null;
  fecha_vencimiento_cae_cai: string | null;

  // strings con JSON embebido (tal cual la API)
  detalles_json: string | null;
  detalles_factura_json: string | null;
  detalles_cobro_json: string | null;

  anulada: "S" | "N" | string;
  anulada_boolean: boolean;

  fecha_registro: string;

  // objetos ya parseados (la API además los trae como arrays/obj)
  detalles: DuxFacturaDetalleDTO[];
  detalles_factura: DuxFacturaRefDTO[] | null;
  detalles_cobro: DuxCobroDTO[] | null;

  presupuesto: DuxPresupuestoDTO | null;
}

export interface DuxFacturaDetalleDTO {
  tmp_det_facturacion_id: number | null;

  cod_item: string;
  item: string;

  ctd: number; // a veces viene 1.0
  precio_uni: NumberLike;

  porc_desc: NumberLike;
  porc_iva: NumberLike;

  comentarios: string | null;

  costo: NumberLike;
  nro_identificacion_trazable: string | null;

  id_moneda: number;
  moneda: string;

  cotizacion_moneda: NumberLike;
  cotizacion_dolar: NumberLike;

  id_lista_precio_venta: number | null;
}

export interface DuxFacturaRefDTO {
  numero_punto_de_venta: number | string; // en json embebido suele venir string
  numero_comprobante: number;
  letra_comprobante: string;
  tipo_comprobante: TipoComp | string;
}

export interface DuxCobroDTO {
  numero_punto_de_venta: number;
  numero_comprobante: number;

  personal: string;
  caja: string;

  detalles_mov_cobro: DuxCobroMovimientoDTO[];
}

export interface DuxCobroMovimientoDTO {
  tipo_de_valor: "EFECTIVO" | "CHEQUE" | "CUENTA" | "TARJETA" | string;
  referencia: string | null;
  monto: NumberLike;
}

export interface DuxPresupuestoDTO {
  nro_presupuesto: number;
  estado: string; // ej "FACTURADO"
  observaciones: string | null;
}
