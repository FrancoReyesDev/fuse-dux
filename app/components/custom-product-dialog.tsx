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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "~/components/ui/field";
import { genCopyText } from "~/lib/gen-copy-text";
import { Copy, Check, Calculator } from "lucide-react";
import type { Product } from "~/types/product";
import type { ConfigConstants } from "~/types/config-constants";

interface Props {
  configs: ConfigConstants;
  children?: React.ReactNode;
}

export function CustomProductDialog({ configs, children }: Props) {
  const [open, setOpen] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [costo, setCosto] = useState<number | "">("");
  const { profitFactorOptions, creditCardFactor, threeInstallmentsFactor } =
    configs;
  const [profit, setProfit] = useState<number | "">(""); // Multiplicador Efectivo

  const [previewText, setPreviewText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!titulo || !costo) {
      setPreviewText("");
      return;
    }

    const costNum = Number(costo);
    const profitNum = profit || 1;
    const price = costNum * profitNum;

    const efTransVal = Math.round(price);
    const credVal = Math.round(price * creditCardFactor);
    const tresPagosVal = Math.round(price * threeInstallmentsFactor);

    setPreviewText(
      genCopyText({
        producto: titulo,
        efTrans: efTransVal.toLocaleString("es-AR"),
        credDebQr: credVal.toLocaleString("es-AR"),
        credito3Pagos: tresPagosVal.toLocaleString("es-AR"),
      }),
    );
  }, [titulo, costo, profit]);

  const handleCopy = () => {
    navigator.clipboard.writeText(previewText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="gap-2">
            <Calculator className="h-4 w-4" />
            Calculadora Custom
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Generador Custom</DialogTitle>
          <DialogDescription>
            Calcula precios y genera el texto para un producto manual.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <Field>
            <FieldLabel htmlFor="titulo">Título</FieldLabel>
            <FieldContent>
              <Input
                id="titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                autoFocus
                placeholder="Ej: Alimento para gato"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="costo">Costo Base</FieldLabel>
            <FieldContent>
              <Input
                id="costo"
                type="number"
                value={costo}
                onChange={(e) => setCosto(Number(e.target.value))}
                step="0.01"
                placeholder="0.00"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel>Ganancia (Seleccionar)</FieldLabel>
            <FieldContent>
              <div className="flex flex-wrap gap-2">
                {profitFactorOptions.map((f) => (
                  <Button
                    key={f}
                    variant={profit === Number(f) ? "default" : "outline"}
                    size="sm"
                    className="h-9 px-4"
                    onClick={() => setProfit(Number(f))}
                  >
                    {f}
                  </Button>
                ))}
              </div>
              <FieldDescription>
                Selecciona uno de los factores configurados.
              </FieldDescription>
            </FieldContent>
          </Field>
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
