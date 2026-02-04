// consultar-estado-factura.dto.ts

export type EstadoProcesoFactura =
  | "PENDIENTE"
  | "EN_PROCESO"
  | "FINALIZADO"
  | "ERROR"
  | string;

export interface ConsultarEstadoFacturaQueryDTO {
  idProceso: number;
}

export interface ConsultarEstadoFacturaResponseDTO {
  estado: EstadoProcesoFactura;
  id_comp_venta?: number; // solo viene cuando FINALIZADO
}
