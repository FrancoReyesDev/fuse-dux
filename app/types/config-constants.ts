import type {
  CategoriaFiscal,
  TipoCompCrear,
  TipoEntrega,
} from "./dux-dto/post-factura-dto";

export interface DuxBillingTemplate {
  name: string;
  id_empresa: number;
  id_sucursal_empresa: number;
  nro_pto_vta: string;
  id_personal: number;
  id_deposito: number;
  categoria_fiscal: CategoriaFiscal;
  tipo_entrega: TipoEntrega;
  tipo_comp: TipoCompCrear;
}

export interface ConfigConstants {
  profitFactorOptions: number[];
  creditCardFactor: number;
  threeInstallmentsFactor: number;
  // Dux Billing Templates
  duxTemplates: DuxBillingTemplate[];
}
