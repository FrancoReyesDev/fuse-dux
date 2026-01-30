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
import { Input } from "~/components/ui/input";
import { Field, FieldContent, FieldLabel } from "~/components/ui/field";
import {
  Plus,
  Trash2,
  Package,
  User,
  CreditCard,
  Truck,
  FileText,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import type { OrderMetadata } from "~/types/order";

// NOTE: This component is designed to handle both New and Edit order states visually.
// Logic implementation is delegated to the parent/user.

export function NewOrderDialog({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // -- State Definitions (Visual State) --

  // Customer
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
  });

  // Metadata
  const [metadata, setMetadata] = useState<OrderMetadata>({
    inverseLogistics: false,
    declaredWeight: 0,
    declaredValue: 0,
    trackingNumber: "",
    totalToCollect: 0,
    shipmentNotes: "",
  });

  // Items
  const [items, setItems] = useState<
    {
      sku: string;
      name: string;
      quantity: number;
      unitPrice: number;
    }[]
  >([]);

  // Order Details
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
      // @ts-ignore - simple dynamic update for UI demo
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
      {/* max-w-screen-xl for a large, expansive view as requested */}
      <DialogContent className=" max-h-[95vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Package className="size-6" /> Gestión de Orden
          </DialogTitle>
          <DialogDescription>
            Administre todos los detalles de la orden, incluyendo cliente, items
            y logística.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto py-4 pr-2"
        >
          <div className="flex flex-col gap-8">
            {/* SECTION 1: CUSTOMER */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                <User className="size-5" /> Datos del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field>
                  <FieldLabel>Nombre Completo</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="Nombre del cliente"
                      value={customer.name}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Teléfono</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="+54 ..."
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="email@ejemplo.com"
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer({ ...customer, name: e.target.value })
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Dirección</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="Calle y altura"
                      value={customer.address}
                      onChange={(e) =>
                        setCustomer({ ...customer, address: e.target.value })
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Ciudad</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="Localidad"
                      value={customer.city}
                      onChange={(e) =>
                        setCustomer({ ...customer, city: e.target.value })
                      }
                    />
                  </FieldContent>
                </Field>
                <Field>
                  <FieldLabel>Código Postal</FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="CPA"
                      value={customer.postalCode}
                      onChange={(e) =>
                        setCustomer({ ...customer, postalCode: e.target.value })
                      }
                    />
                  </FieldContent>
                </Field>
              </div>
            </div>

            {/* SECTION 2: ITEMS TABLE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <CreditCard className="size-5" /> Items de la Orden
                </h3>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  size="sm"
                  variant="outline"
                >
                  <Plus className="size-4 mr-2" /> Agregar Producto
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead className="w-[150px]">SKU</TableHead>
                      <TableHead>Nombre del Producto</TableHead>
                      <TableHead className="w-[100px] text-right">
                        Cantidad
                      </TableHead>
                      <TableHead className="w-[150px] text-right">
                        Precio Unit.
                      </TableHead>
                      <TableHead className="w-[150px] text-right">
                        Total
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="h-32 text-center text-muted-foreground"
                        >
                          No hay items en la orden. Presione "Agregar Producto"
                          para comenzar.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>
                            <Input
                              value={item.sku}
                              onChange={(e) =>
                                updateItem(idx, "sku", e.target.value)
                              }
                              className="h-8"
                              placeholder="SKU..."
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                updateItem(idx, "name", e.target.value)
                              }
                              className="h-8"
                              placeholder="Descripción..."
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  idx,
                                  "quantity",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 text-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateItem(
                                  idx,
                                  "unitPrice",
                                  Number(e.target.value),
                                )
                              }
                              className="h-8 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right font-medium text-lg">
                            ${(item.quantity * item.unitPrice).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive/90"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* SECTION 3: METADATA & LOGISTICS */}
            <div className="bg-muted/30 p-4 rounded-lg border">
              <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-primary">
                <Truck className="size-5" /> Logística y Metadatos
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel>Tracking Number</FieldLabel>
                    <FieldContent>
                      <Input
                        value={metadata.trackingNumber}
                        onChange={(e) =>
                          setMetadata({
                            ...metadata,
                            trackingNumber: e.target.value,
                          })
                        }
                        placeholder="Ej: AA123456789"
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Peso Declarado (Kg)</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        step="0.1"
                        value={metadata.declaredWeight || ""}
                        onChange={(e) =>
                          setMetadata({
                            ...metadata,
                            declaredWeight: Number(e.target.value),
                          })
                        }
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Valor Declarado ($)</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        step="0.01"
                        value={metadata.declaredValue || ""}
                        onChange={(e) =>
                          setMetadata({
                            ...metadata,
                            declaredValue: Number(e.target.value),
                          })
                        }
                      />
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Total a Cobrar ($)</FieldLabel>
                    <FieldContent>
                      <Input
                        type="number"
                        step="0.01"
                        value={metadata.totalToCollect || ""}
                        onChange={(e) =>
                          setMetadata({
                            ...metadata,
                            totalToCollect: Number(e.target.value),
                          })
                        }
                      />
                    </FieldContent>
                  </Field>
                  <Field className="md:col-span-2">
                    <FieldLabel>Notas de Envío</FieldLabel>
                    <FieldContent>
                      <Input
                        value={metadata.shipmentNotes || ""}
                        onChange={(e) =>
                          setMetadata({
                            ...metadata,
                            shipmentNotes: e.target.value,
                          })
                        }
                        placeholder="Instrucciones para el correo..."
                      />
                    </FieldContent>
                  </Field>
                </div>

                <div className="flex flex-col gap-4 justify-center border-l pl-6">
                  <label className="flex items-center gap-3 p-3 border rounded-md bg-background cursor-pointer hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border-primary text-primary focus:ring-primary"
                      checked={metadata.inverseLogistics}
                      onChange={(e) =>
                        setMetadata({
                          ...metadata,
                          inverseLogistics: e.target.checked,
                        })
                      }
                    />
                    <span className="font-medium">Logística Inversa</span>
                  </label>

                  <Field>
                    <FieldLabel>Método de Pago</FieldLabel>
                    <FieldContent>
                      <Input
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        placeholder="Ej: Transferencia"
                      />
                    </FieldContent>
                  </Field>
                </div>
              </div>
            </div>

            {/* SECTION 4: OBSERVATIONS & TOTAL */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-primary">
                  <FileText className="size-5" /> Observaciones Generales
                </h3>
                {/* Using standard textarea with Tailwind classes for robustness */}
                <textarea
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Notas internas o comentarios adicionales sobre la orden..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
              <div className="flex flex-col justify-end items-end bg-primary/5 p-6 rounded-xl border border-primary/20">
                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
                  Total Final
                </span>
                <span className="text-4xl font-bold text-primary mt-1">
                  $
                  {calculateTotal().toLocaleString("es-AR", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="lg" className="min-w-[150px]">
              Guardar Orden
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
