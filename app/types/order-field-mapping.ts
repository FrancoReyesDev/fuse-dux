import type { Order } from "./order";

export enum ORDER_FIELD_MAPPING {
  nombre_cliente = "customer.name",
  direccion_cliente = "customer.address",
  ciudad_cliente = "customer.city",
  cp_cliente = "customer.postalCode",
  telefono_cliente = "customer.phone",
  email_cliente = "customer.email",
  monto_total = "totalHelper.total",
  cantidad_items = "items.length",
  fecha_creacion = "createdAt",
  items = "items",
  observaciones = "observations",
}

export const AVAILABLE_ORDER_FIELDS = Object.keys(ORDER_FIELD_MAPPING);
