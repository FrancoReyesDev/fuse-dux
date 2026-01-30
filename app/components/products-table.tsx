import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Copy, Check } from "lucide-react";
import type { Product } from "~/types/product";
import type { FuseResult } from "fuse.js";
import { genCopyText } from "~/lib/gen-copy-text";
import { useState } from "react";

interface ProductsTableProps {
  results: FuseResult<Product>[];
}

function CopyButton({ product }: { product: Product }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = genCopyText({
      producto: product.producto,
      credito3Pagos: product.precios.credito3Pagos,
      credDebQr: product.precios.credDebQr,
      efTrans: product.precios.efTrans,
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      title="Copiar info"
    >
      <div
        className={`transition-all duration-300 ${
          copied ? "scale-100 rotate-0" : "scale-100 rotate-0"
        }`}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500 animate-in zoom-in spin-in-90 duration-300" />
        ) : (
          <Copy className="h-4 w-4 transition-transform active:scale-90" />
        )}
      </div>
    </Button>
  );
}

export function ProductsTable({ results }: ProductsTableProps) {
  return (
    <div className="rounded-md border w-full p-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Rubro</TableHead>
            <TableHead className="text-right">Ef/Trans</TableHead>
            <TableHead className="text-right">Cred/Deb/QR</TableHead>
            <TableHead className="text-right">3 Pagos</TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Sin resultados.
              </TableCell>
            </TableRow>
          ) : (
            results.map(({ item }) => (
              <TableRow key={item.codigo}>
                <TableCell className="font-medium">{item.codigo}</TableCell>
                <TableCell>{item.producto}</TableCell>
                <TableCell>{item.marca || "-"}</TableCell>
                <TableCell>{item.rubro || "-"}</TableCell>
                <TableCell className="text-right">
                  {item.precios.efTrans}
                </TableCell>
                <TableCell className="text-right">
                  {item.precios.credDebQr}
                </TableCell>
                <TableCell className="text-right">
                  {item.precios.credito3Pagos}
                </TableCell>
                <TableCell>
                  <CopyButton product={item} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
