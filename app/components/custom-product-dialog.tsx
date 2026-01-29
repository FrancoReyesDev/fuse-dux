import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { genCopyText } from "~/lib/gen-copy-text";
import { Copy, Check, Calculator } from "lucide-react";
import type { ProductCsvRow } from "~/types/product-csv-row";

export function CustomProductDialog() {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [costo, setCosto] = useState<number | "">("");
  const [profit, setProfit] = useState<number | "">(""); // Multiplicador Efectivo
  const [factorTarjeta, setFactorTarjeta] = useState<number | "">(""); // Multiplicador Tarjeta
  const [factor3Cuotas, setFactor3Cuotas] = useState<number | "">(""); // Multiplicador 3 Cuotas
  const [previewText, setPreviewText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!titulo || !costo || costo === "") {
      setPreviewText("");
      return;
    }

    const costNum = Number(costo);
    const profitNum = Number(profit) || 1;
    const factorTarjetaNum = Number(factorTarjeta) || 1;
    const factor3CuotasNum = Number(factor3Cuotas) || 1;

    const efTransVal = Math.round(costNum * profitNum);
    const credVal = Math.round(costNum * factorTarjetaNum);
    const tresPagosVal = Math.round(costNum * factor3CuotasNum);

    const mockProduct: ProductCsvRow = {
      codigo: "CUSTOM",
      producto: titulo,
      precios: {
        efTrans: efTransVal.toLocaleString("es-AR"),
        credDebQr: credVal.toLocaleString("es-AR"),
        credito3Pagos: tresPagosVal.toLocaleString("es-AR"),
        // Fill other required fields with defaults
        credito6Cuotas: "0",
        hotSale: "0",
        mayorista: "0",
        meli: "0",
        meli12Cuotas: "0",
        meli3Cuotas: "0",
        meli6Cuotas: "0",
        meli9Cuotas: "0",
        meliBajoInteres: "0",
      },
      stock: {
        depositoHowler: "0",
        depositoSanJose: "0",
        full: "0",
        localSanJuan: "0",
      },
    };

    setPreviewText(genCopyText(mockProduct));
  }, [titulo, costo, profit, factorTarjeta, factor3Cuotas]);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          Calculadora Custom
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generador Custom</DialogTitle>
          <DialogDescription>
            Calcula precios y genera el texto para un producto manual.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titulo" className="text-right">
              Titulo
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="costo" className="text-right">
              Costo Base
            </Label>
            <Input
              id="costo"
              type="number"
              value={costo}
              onChange={(e) => setCosto(Number(e.target.value))}
              className="col-span-3"
              step="0.01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="profit" className="text-right text-xs">
              Factor Efvo.
            </Label>
            <Input
              id="profit"
              type="number"
              value={profit}
              onChange={(e) => setProfit(Number(e.target.value))}
              className="col-span-3"
              step="0.01"
              placeholder="Ej: 1.5"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="factorTarjeta" className="text-right text-xs">
              Factor Tarjeta
            </Label>
            <Input
              id="factorTarjeta"
              type="number"
              value={factorTarjeta}
              onChange={(e) => setFactorTarjeta(Number(e.target.value))}
              className="col-span-3"
              step="0.01"
              placeholder="Ej: 1.6"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="factor3Cuotas" className="text-right text-xs">
              Factor 3 Cuotas
            </Label>
            <Input
              id="factor3Cuotas"
              type="number"
              value={factor3Cuotas}
              onChange={(e) => setFactor3Cuotas(Number(e.target.value))}
              className="col-span-3"
              step="0.01"
              placeholder="Ej: 1.8"
            />
          </div>
        </div>

        {previewText && (
          <div className="relative rounded-md bg-muted p-4">
            <pre className="whitespace-pre-wrap font-mono text-xs">
              {previewText}
            </pre>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={handleCopy}
            >
              <div
                className={`transition-all duration-300 ${
                  copied ? "scale-100 rotate-0" : "scale-100 rotate-0"
                }`}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500 animate-in zoom-in spin-in-90 duration-300" />
                ) : (
                  <Copy className="h-3 w-3 transition-transform active:scale-90" />
                )}
              </div>
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
