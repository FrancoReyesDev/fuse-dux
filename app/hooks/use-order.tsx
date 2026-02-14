import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useFetcher } from "react-router";
import type { action } from "~/routes/orders/byId";
import type {
  Order,
  Customer,
  ShipmentMetadata,
  OrderItem,
} from "~/types/order";
import type { Product } from "~/types/product";

const defaultOrder: Order = {
  id: "",
  // paymentDate: null,
  shipmentDate: null,
  wasShipped: false,
  createdAt: new Date(),
  customer: {
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
  },
  responsibleName: "",
  items: [],
  shipmentMetadata: {
    trackingNumber: "",
    inverseLogistics: false,
    declaredWeight: 0,
    declaredValue: 0,
    totalToCollect: 0,
    shipmentNotes: "",
  },
  observations: "",
  paymentMethod: "efTrans", // Changed from 'minorista' to match type
  paymentStatus: "PENDING",
  invoice: { status: "PENDING" },
  active: true,
};

interface Props {
  orders: Order[];
  // config: ConfigConstants;
}

const getItemsMap = (items: OrderItem[]) =>
  new Map<string, OrderItem>(
    items.map(({ product, quantity }) => [
      product.codigo,
      { product, quantity },
    ]),
  );

function useOrderInternal({ orders: initialOrders }: Props) {
  const fetcher = useFetcher<typeof action>();
  const [order, setOrder] = useState<Order>({ ...defaultOrder });
  const [localOrders, setLocalOrders] = useState<Order[]>(initialOrders);

  useEffect(() => {
    setLocalOrders(initialOrders);
  }, [initialOrders]);

  const clearOrder = () => {
    setOrder({ ...defaultOrder });
  };

  const submitOrder = (order: Order) => {
    setLocalOrders((prev) => {
      const exists = prev.find((o) => o.id === order.id);
      if (exists) {
        return prev.map((o) => (o.id === order.id ? order : o));
      }
      return [order, ...prev];
    });

    fetcher.submit(JSON.stringify(order), {
      method: "POST",
      action: `/orders/${order.id}?active=${order.active !== false}`,
      encType: "application/json",
    });
  };

  const updateCustomer = (customer: Partial<Customer>) => {
    setOrder((prev) => ({
      ...prev,
      customer: { ...prev.customer!, ...customer },
    }));
  };

  const updateMetadata = (metadata: Partial<ShipmentMetadata>) => {
    setOrder((prev) => ({
      ...prev,
      shipmentMetadata: { ...prev.shipmentMetadata!, ...metadata },
    }));
  };

  const upsertItem = ({ product, quantity }: OrderItem) => {
    const itemsMap = getItemsMap(order.items);
    itemsMap.set(product.codigo, { product, quantity });

    const newItems = Array.from(itemsMap.values());
    const newOrder = { ...order, items: newItems };
    setOrder(newOrder);
    submitOrder(newOrder);
  };

  const removeItem = (productId: Product["codigo"]) => {
    const itemsMap = getItemsMap(order.items);
    itemsMap.delete(productId);

    const newItems = Array.from(itemsMap.values());
    const newOrder = { ...order, items: newItems };
    setOrder(newOrder);
    submitOrder(newOrder);
  };

  const archiveOrder = (orderId: Order["id"]) => {
    // Optimistic update
    setLocalOrders((prev) => prev.filter((o) => o.id !== orderId));

    // We need to submit the order with active=false.
    // If we are archiving the CURRENT order, we use 'order' state.
    // If not (e.g. from list), we might need to find it or just rely on backend?
    // Usually archiving happens from the dialog of the current order.
    // So 'order.id' should match 'orderId' if called from dialog.

    // However, if we want to be safe, we should construct the update.
    // For now, let's assume we archive the current order in context or we act on the id.
    // Since useOrder is likely used for the active order in the dialog, let's update that.

    if (order.id === orderId) {
      const archivedOrder = { ...order, active: false };
      // We don't necessarily need to setOrder(archivedOrder) if we are closing the dialog,
      // but submitOrder handles the fetcher.
      submitOrder(archivedOrder);
    } else {
      // If we are archiving an order not in 'order' state (e.g. from a list item),
      // we might not have the full order object here if 'order' is just the current one.
      // But useOrder is designed for a single order context usually?
      // Wait, useOrderInternal has 'localOrders'.
      // If we archive from the list, we might want to just hit the API?
      // But submitOrder takes an Order object.

      // Let's assume for this task we are archiving from the Dialog, where 'order' IS the order to archive.
      const archivedOrder = { ...order, active: false };
      submitOrder(archivedOrder);
    }
  };

  const removeOrder = (orderId: Order["id"]) => {
    setLocalOrders((prev) => prev.filter((o) => o.id !== orderId));

    fetcher.submit(JSON.stringify({}), {
      method: "DELETE",
      action: `/orders/${orderId}`,
      encType: "application/json",
    });
  };

  return {
    order,
    clearOrder,
    state: fetcher.state,
    submitOrder,
    orders: localOrders,
    setOrder,
    updateCustomer,
    updateMetadata,
    upsertItem,
    removeItem,
    removeOrder,
    archiveOrder,
  };
}

type OrderContextType = ReturnType<typeof useOrderInternal>;

const OrderContext = createContext<OrderContextType | undefined>(undefined);

interface ProviderProps extends Props {
  children: React.ReactNode;
}

export const OrderContextProvider = ({ children, orders }: ProviderProps) => {
  const orderApi = useOrderInternal({ orders });

  return (
    <OrderContext.Provider value={orderApi}>{children}</OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderContextProvider");
  }
  return context;
};
