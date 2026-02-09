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
  product: Product;
  quantity: number;
}
export type PaymentMethod = keyof Product["precios"];

export interface Order {
  id: string;
  createdAt: Date;
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: "PAID" | "PENDING";
  // paymentDate: Date | null;
  wasShipped: boolean;
  shipmentDate: Date | null;
  invoice: {
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "ERROR";
    id?: number;
  };
  customer: Customer;
  responsibleName: string;
  // shipmentMetadata: ShipmentMetadata;
  shipmentMetadata: Record<string, string | number>;
  observations: string | null;
}
