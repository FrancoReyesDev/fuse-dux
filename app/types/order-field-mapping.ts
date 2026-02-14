import type { Order } from "./order";

export enum ORDER_FIELD_MAPPING {
  nombre_cliente = "customer.name",
  direccion_cliente = "customer.address",
  ciudad_cliente = "customer.city",
  provincia_cliente = "customer.province",
  cp_cliente = "customer.zipCode",
  telefono_cliente = "customer.phone",
  email_cliente = "customer.email",
  dni_cliente = "customer.docNumber",
  monto_total = "totalHelper.total",
  cantidad_items = "items.length",
  fecha_creacion = "createdAt",
  observaciones = "observations",
}

export const AVAILABLE_ORDER_FIELDS = Object.keys(ORDER_FIELD_MAPPING);
