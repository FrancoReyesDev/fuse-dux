import { Plus, Trash2, CreditCard } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from "~/lib/utils";

interface Item {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ItemsTableProps {
  items: Item[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (
    index: number,
    field: keyof Item,
    value: string | number,
  ) => void;
}

export function ItemsTable({
  items,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
}: ItemsTableProps) {
  const total = items.reduce(
    (acc, item) => acc + item.quantity * item.unitPrice,
    0,
  );

  // Common styles for column widths to ensure alignment across split tables
  // SKU: 120px, Name: Auto, Qty: 100px, Price: 120px, Total: 120px, Actions: 50px
  const colWidths = [
    "w-[120px]", // SKU
    "w-auto", // Name (flex-1 behavior in table is default for unassigned width)
    "w-[100px]", // Qty
    "w-[120px]", // Price
    "w-[120px]", // Total
    "w-[50px]", // Actions
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <CreditCard className="size-5" /> Items de la Orden
        </h3>
        <Button type="button" onClick={onAddItem} size="sm" variant="outline">
          <Plus className="size-4 mr-2" /> Agregar Producto
        </Button>
      </div>

      <div className="rounded-md border bg-background flex flex-col overflow-hidden">
        {/* Fixed Header Table */}
        <div className="bg-muted border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className={colWidths[0]}>SKU</TableHead>
                <TableHead className={colWidths[1]}>
                  Nombre del Producto
                </TableHead>
                <TableHead className={cn(colWidths[2], "text-right")}>
                  Cantidad
                </TableHead>
                <TableHead className={cn(colWidths[3], "text-right")}>
                  Precio Unit.
                </TableHead>
                <TableHead className={cn(colWidths[4], "text-right")}>
                  Total
                </TableHead>
                <TableHead className={colWidths[5]}></TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Body Table */}
        <ScrollArea className="h-50">
          <Table className="table-fixed">
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-50 text-center text-muted-foreground"
                  >
                    No hay items en la orden. Presione "Agregar Producto" para
                    comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    <TableCell className={cn(colWidths[0], "p-2")}>
                      <Input
                        value={item.sku}
                        onChange={(e) =>
                          onUpdateItem(idx, "sku", e.target.value)
                        }
                        className="h-8 focus-visible:ring-0 px-2"
                        placeholder="SKU..."
                      />
                    </TableCell>
                    <TableCell className={cn(colWidths[1], "p-2")}>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          onUpdateItem(idx, "name", e.target.value)
                        }
                        className="h-8 focus-visible:ring-0 px-2"
                        placeholder="Descripción..."
                      />
                    </TableCell>
                    <TableCell className={cn(colWidths[2], "p-2")}>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          onUpdateItem(idx, "quantity", Number(e.target.value))
                        }
                        className="h-8 text-right focus-visible:ring-0 px-2"
                      />
                    </TableCell>
                    <TableCell className={cn(colWidths[3], "p-2")}>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          onUpdateItem(idx, "unitPrice", Number(e.target.value))
                        }
                        className="h-8 text-right focus-visible:ring-0 px-2"
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        colWidths[4],
                        "text-right font-medium text-lg px-4",
                      )}
                    >
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className={cn(colWidths[5], "text-center p-2")}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/90"
                        onClick={() => onRemoveItem(idx)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Fixed Footer Table */}
        <div className="bg-secondary/30 border-t font-medium">
          <Table className="table-fixed">
            <TableFooter className="bg-transparent border-0">
              <TableRow>
                <TableCell className={colWidths[0]}></TableCell>
                <TableCell className={colWidths[1]}></TableCell>
                <TableCell className={colWidths[2]}></TableCell>
                <TableCell className={cn(colWidths[3], "text-right")}>
                  Total Final
                </TableCell>
                <TableCell
                  className={cn(
                    colWidths[4],
                    "text-right text-lg font-bold text-primary",
                  )}
                >
                  ${total.toFixed(2)}
                </TableCell>
                <TableCell className={colWidths[5]}></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
}
