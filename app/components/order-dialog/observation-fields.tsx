import { FileText } from "lucide-react";
import { Field, FieldLabel } from "../ui/field";

interface ObservationFieldsProps {
  observations: string;
  total: number;
  onObservationsChange: (value: string) => void;
}

export function ObservationFields({
  observations,
  total,
  onObservationsChange,
}: ObservationFieldsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-4">
      <div className="lg:col-span-2">
        <h3 className="text-lg font-semibold flex items-center gap-2 mb-2 text-primary">
          <FileText className="size-5" /> Observaciones Generales
        </h3>
        <Field>
          {/* FieldLabel is optional if using a header, but good for a11y association if wrapping */}
          <FieldLabel className="sr-only">Observaciones</FieldLabel>
          <textarea
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Notas internas o comentarios adicionales sobre la orden..."
            value={observations}
            onChange={(e) => onObservationsChange(e.target.value)}
          />
        </Field>
      </div>
      <div className="flex flex-col justify-end items-end bg-primary/5 p-6 rounded-xl border border-primary/20">
        <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">
          Total Final
        </span>
        <span className="text-4xl font-bold text-primary mt-1">
          $
          {total.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
          })}
        </span>
      </div>
    </div>
  );
}
