import type { Order } from "~/types/order";
import { ORDER_FIELD_MAPPING } from "~/types/order-field-mapping";
import { stringToFloat } from "./string-to-float";
import { Effect, pipe } from "effect";

export function mapOrderToField(
  order: Order,
  fieldKey: string,
): string | number {
  switch (fieldKey) {
    case "nombre_cliente":
      return order.customer.name;
    case "direccion_cliente":
      return order.customer.address;
    case "ciudad_cliente":
      return order.customer.city;
    case "cp_cliente":
      return order.customer.postalCode;
    case "telefono_cliente":
      return order.customer.phone;
    case "email_cliente":
      return order.customer.email || "";
    case "monto_total":
      return calculateOrderTotal(order);
    case "cantidad_items":
      return order.items.length;
    case "items":
      return order.items
        .map((item) => {
          const price = Effect.runSync(
            stringToFloat(item.product.precios[order.paymentMethod] || "0"),
          );
          const formattedPrice = price.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          });
          return `${item.quantity} x ${item.product.producto} ($${formattedPrice})`;
        })
        .join("\n");
    case "fecha_creacion":
      return order.createdAt.toLocaleDateString();
    case "observaciones":
      return order.observations || "";
    default:
      return "";
  }
}

function calculateOrderTotal(order: Order): number {
  return order.items.reduce((total, item) => {
    const priceString = item.product.precios[order.paymentMethod] || "0";
    const price = pipe(stringToFloat(priceString), Effect.runSync);
    return total + price * item.quantity;
  }, 0);
}
