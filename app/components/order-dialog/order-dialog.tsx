import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Package,
  User,
  ListOrdered,
  Truck,
  ChevronLeft,
  Receipt,
  FileUp,
  Save,
} from "lucide-react";
import { useOrder } from "~/hooks/use-order";
import { ItemFields } from "./items-fields";
import { GeneralInformationFields } from "./general-information-fields";
import { ScrollArea } from "../ui/scroll-area";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function OrderDialog({ open, setOpen }: Props) {
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    if (open) {
      setActiveTab("general");
    }
  }, [open]);

  const {
    order,
    updateCustomer,
    setOrder,
    submitOrder,
    removeItem,
    removeOrder,
    upsertItem,
  } = useOrder();

  const handleSubmit = () => {
    submitOrder({
      ...order,
      id: order.id === "" ? crypto.randomUUID() : order.id,
    });
    setOpen(false);
  };

  const handleRemoveOrder = () => {
    removeOrder(order.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-4xl w-full flex flex-col p-6 h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="size-6" /> Gestión de Orden
          </DialogTitle>
          <DialogDescription>
            Cargue los datos del cliente, items y logística.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col min-h-0 gap-3"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <User className="size-4" /> General
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <ListOrdered className="size-4" /> Items
            </TabsTrigger>
            <TabsTrigger value="logistica" className="flex items-center gap-2">
              <Truck className="size-4" /> Logística
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[56vh]">
            <TabsContent value="general">
              <div className="w-full bg-muted/30 p-4 rounded-lg border">
                <GeneralInformationFields
                  customer={order.customer!}
                  responsibleName={order.responsibleName!}
                  paymentMethod={order.paymentMethod}
                  paymentStatus={order.paymentStatus}
                  wasShipped={order.wasShipped}
                  shipmentDate={
                    order.shipmentDate ? new Date(order.shipmentDate) : null
                  }
                  invoiceStatus={order.invoice?.status || "PENDING"}
                  observations={order.observations}
                  onCustomerChange={updateCustomer}
                  onResponsibleNameChange={(name) =>
                    setOrder((prev) => ({ ...prev, responsibleName: name }))
                  }
                  onPaymentMethodChange={(method) =>
                    setOrder((prev) => ({ ...prev, paymentMethod: method }))
                  }
                  onPaymentStatusChange={(status) =>
                    setOrder((prev) => ({ ...prev, paymentStatus: status }))
                  }
                  onObservationsChange={(observations) =>
                    setOrder((prev) => ({ ...prev, observations }))
                  }
                />
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-0 space-y-6">
              <div className="w-full bg-muted/30 rounded-lg border">
                <ItemFields
                  orderItems={order.items}
                  paymentMethod={order.paymentMethod}
                  onRemoveItem={removeItem}
                  onUpdateItem={upsertItem}
                />
              </div>
            </TabsContent>

            <TabsContent value="logistica" className="mt-0 space-y-6">
              <div className="flex justify-start pt-4">
                <Button variant="ghost" onClick={() => setActiveTab("items")}>
                  <ChevronLeft className="size-4 mr-2" /> Volver a Items
                </Button>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-auto flex flex-row gap-3">
          <div className="flex-1 flex flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => console.log("Facturando...")}
              className="flex items-center gap-2"
            >
              <Receipt className="size-4" /> Facturar
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log("Exportando Logística...")}
              className="flex items-center gap-2"
            >
              <FileUp className="size-4" /> Exportar Logística
            </Button>
          </div>
          <div className="flex flex-row gap-3">
            {order.id && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Borrar Orden</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Borrar esta orden?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Si confirmas, la orden se eliminará de la lista.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRemoveOrder}
                      variant="destructive"
                    >
                      Borrar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-700 font-bold flex items-center gap-2 px-8"
            >
              <Save className="size-4" /> Guardar Orden
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
