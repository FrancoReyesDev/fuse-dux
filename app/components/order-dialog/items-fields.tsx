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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";

import type { OrderItem, PaymentMethod } from "~/types/order";
import type { Product } from "~/types/product";

interface ItemsFieldsProps {
  orderItems: OrderItem[];
  paymentMethod: PaymentMethod;
  onRemoveItem: (productId: Product["codigo"]) => void;
  onUpdateItem: (item: OrderItem) => void;
}

export function ItemFields({
  orderItems,
  paymentMethod,
  onRemoveItem,
  onUpdateItem,
}: ItemsFieldsProps) {
  // Common styles for column widths

  const widths = {
    sku: "w-32",
    product: "", // takes remaining space
    quantity: "w-24",
    price: "w-24",
    subtotal: "w-24",
    actions: "w-12",
  };

  const onUpdateItemQuantity = (
    productId: Product["codigo"],
    quantity: number,
  ) => {
    const item = orderItems.find((item) => item.product.codigo === productId);
    if (item) {
      onUpdateItem({ ...item, quantity });
    }
  };

  return (
    <div className="rounded-md flex flex-col overflow-hidden">
      <div className="bg-muted border-b">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className={widths.sku}>SKU</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead className={cn("text-right", widths.quantity)}>
                Cant.
              </TableHead>
              <TableHead className={cn("text-right", widths.price)}>
                Precio
              </TableHead>
              <TableHead className={cn("text-right", widths.subtotal)}>
                Subtotal
              </TableHead>
              <TableHead className={widths.actions} />
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      <ScrollArea className="h-[40vh]">
        <Table className="table-fixed">
          <TableBody>
            {orderItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-50 text-center text-muted-foreground"
                >
                  No hay items.
                </TableCell>
              </TableRow>
            ) : (
              orderItems.map(({ product, quantity }, idx) => {
                const price = parseFloat(product.precios[paymentMethod] || "0");

                return (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    <TableCell
                      className={cn(
                        "p-2 font-mono text-xs uppercase truncate",
                        widths.sku,
                      )}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate cursor-default">
                            {product.codigo}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {product.codigo}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="p-2 text-sm truncate">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="truncate cursor-default">
                            {product.producto}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          {product.producto}
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className={cn("p-2", widths.quantity)}>
                      <Input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) =>
                          onUpdateItemQuantity(
                            product.codigo,
                            Number(e.target.value),
                          )
                        }
                        className="h-8 text-right focus-visible:ring-0 px-2"
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "p-2 text-right truncate whitespace-nowrap",
                        widths.price,
                      )}
                    >
                      $
                      {price.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-medium px-4 truncate whitespace-nowrap",
                        widths.subtotal,
                      )}
                    >
                      $
                      {(quantity * price).toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell
                      className={cn("text-center p-2", widths.actions)}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => onRemoveItem(product.codigo)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      <div className="bg-secondary/30 border-t font-medium">
        <Table className="table-fixed">
          <TableFooter className="bg-transparent border-0">
            <TableRow>
              <TableCell className="text-right font-bold" colSpan={4}>
                TOTAL
              </TableCell>
              <TableCell
                className={cn(
                  "text-right text-lg font-bold text-primary truncate whitespace-nowrap",
                  widths.subtotal,
                )}
              >
                $
                {orderItems
                  .reduce((acc, { product, quantity }) => {
                    const price = parseFloat(
                      product.precios[paymentMethod] || "0",
                    );
                    return acc + quantity * price;
                  }, 0)
                  .toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className={widths.actions} />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
