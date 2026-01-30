import type { Product } from "./product";

/**
 * Represents a customer in the system.
 */
export interface Customer {
  /** Full name of the customer */
  name: string;
  /** Primary contact phone number. Mandatory. */
  phone: string;
  /** Shipping address street and number */
  address: string;
  /** City or locality name */
  city: string;
  /** Postal or ZIP code */
  postalCode: string;
  /** Email address, if available */
  email: string | null;
}

/**
 * Additional metadata for the order, primarily derived from shipment tickets.
 */
export interface OrderMetadata {
  /** Whether the shipment involves reverse logistics (e.g. returns) */
  inverseLogistics?: boolean;
  /** Declared weight of the package in Kg */
  declaredWeight?: number | null;
  /** Declared value of the package for insurance/shipping purposes */
  declaredValue?: number;
  /** Tracking number from the shipping provider */
  trackingNumber: string;
  /** Total amount to be collected upon delivery, if applicable */
  totalToCollect?: number;
  /** Additional notes or observations from the shipment ticket */
  shipmentNotes?: string | null;
}

/**
 * Represents an individual item within an order.
 */
export interface OrderItem {
  /** The product being ordered */
  product: Product;
  /** Quantity of the product */
  quantity: number;
}

/**
 * Main Order entity representing a purchase.
 */
export interface Order {
  /** Unique identifier for the order */
  id: string;
  /** Date when the order was created/sold */
  createdAt: Date;
  /** List of items included in the order */
  items: OrderItem[];
  /** Payment method used (e.g. "Credit Card", "Cash") */
  paymentMethod: string;
  /** Customer information associated with the order */
  customer: Customer;
  /** Extended metadata for shipping and logistics */
  metadata: OrderMetadata;
  /** General observations or notes about the order */
  observations: string | null;
}

export type PaymentMethod = keyof Product["precios"];
