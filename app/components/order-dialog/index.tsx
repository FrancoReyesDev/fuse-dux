import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Package, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import type { Customer, ShipmentMetadata } from "~/types/order";

import { ItemsTable } from "./items-table";
import { ObservationFields } from "./observation-fields";
import { GeneralInformationFields } from "./general-information-fields";

export function OrderDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // -- State Definitions --

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
  });

  const [metadata, setMetadata] = useState<ShipmentMetadata>({
    inverseLogistics: false,
    declaredWeight: 0,
    declaredValue: 0,
    trackingNumber: "",
    totalToCollect: 0,
    shipmentNotes: "",
  });

  const [items, setItems] = useState<
    {
      sku: string;
      name: string;
      quantity: number;
      unitPrice: number;
    }[]
  >([]);

  const [paymentMethod, setPaymentMethod] = useState("");
  const [observations, setObservations] = useState("");

  // -- Handlers --

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { sku: "", name: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof (typeof items)[0],
    value: string | number,
  ) => {
    setItems((prev) => {
      const newItems = [...prev];
      // @ts-ignore - simple dynamic update
      newItems[index][field] = value;
      return newItems;
    });
  };

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Order Data Submitted:", {
      customer,
      items,
      metadata,
      paymentMethod,
      observations,
      total: calculateTotal(),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon">
            <Plus className="size-4" />
            <span className="sr-only">Nueva/Editar Orden</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl w-full flex flex-col p-6 min-h-0">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="size-6" /> Gestión de Orden
          </DialogTitle>
          <DialogDescription>
            Administre todos los detalles de la orden, divididos por secciones.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 gap-6"
        >
          <Tabs
            defaultValue="general"
            className="flex flex-col flex-1 min-h-0 w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Información General</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
            </TabsList>

            <div className="pr-4 pb-4">
              <TabsContent value="items" className="mt-0 border-0 space-y-6">
                <ItemsTable
                  items={items}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onUpdateItem={updateItem}
                />

                <div className="h-px bg-border" />

                <ObservationFields
                  observations={observations}
                  total={calculateTotal()}
                  onObservationsChange={setObservations}
                />
              </TabsContent>

              <TabsContent value="general" className="mt-0 border-0 space-y-6">
                <GeneralInformationFields
                  customer={customer}
                  metadata={metadata}
                  paymentMethod={paymentMethod}
                  onCustomerChange={setCustomer}
                  onMetadataChange={setMetadata}
                  onPaymentMethodChange={setPaymentMethod}
                />
              </TabsContent>
            </div>
          </Tabs>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" size="lg" className="min-w-37.5">
            Guardar Orden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
