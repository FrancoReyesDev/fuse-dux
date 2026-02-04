import type { Product } from "./product";

export interface Customer {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  email: string | null;
}

export interface ShipmentMetadata {
  inverseLogistics?: boolean;
  declaredWeight?: number;
  declaredValue?: number;
  trackingNumber: string;
  /** Total amount to be collected upon delivery, if applicable */
  totalToCollect?: number;
  /** Change amount */
  change?: number;
  shipmentNotes?: string;
}

export interface OrderItem {
  productId: Product["codigo"];
  quantity: number;
}
export type PaymentMethod = keyof Product["precios"];

export interface Order {
  id: string;
  createdAt: Date;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  paymentDate: Date;
  wasShipped: boolean;
  shipmentDate: Date;
  invoice: {
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ERROR";
    id?: number;
  };
  customer: Customer;
  shipmentMetadata: ShipmentMetadata;
  observations: string | null;
}
