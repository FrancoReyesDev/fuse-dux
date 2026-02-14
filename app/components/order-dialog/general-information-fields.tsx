import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import type { Customer, PaymentMethod } from "~/types/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Props {
  customer: Customer;
  responsibleName: string;
  paymentStatus: "PAID" | "PENDING";
  wasShipped: boolean;
  shipmentDate: Date | null;
  invoiceStatus: string;
  observations: string | null;
  onCustomerChange: (customer: Customer) => void;
  onResponsibleNameChange: (name: string) => void;
  onPaymentStatusChange: (status: "PAID" | "PENDING") => void;
  onObservationsChange: (observations: string) => void;
}

export function GeneralInformationFields({
  customer,
  responsibleName,
  paymentStatus,
  wasShipped,
  shipmentDate,
  invoiceStatus,
  observations,
  onCustomerChange,
  onResponsibleNameChange,
  onPaymentStatusChange,
  onObservationsChange,
}: Props) {
  const handleChange =
    (field: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) => {
      onCustomerChange({ ...customer, [field]: e.target.value });
    };

  return (
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Responsable de la Orden</FieldLegend>
        <FieldDescription>
          Información de la persona que toma la orden
        </FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="responsible">
              Nombre del Responsable
            </FieldLabel>
            <Input
              id="responsible"
              placeholder="Quién toma la orden"
              className="w-full max-w-md"
              value={responsibleName}
              onChange={(e) => onResponsibleNameChange(e.target.value)}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Datos del Cliente</FieldLegend>
        <FieldDescription>Información del cliente</FieldDescription>
        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="customer-name">Nombre Completo</FieldLabel>
            <Input
              id="customer-name"
              placeholder="Nombre del cliente"
              value={customer.name}
              onChange={handleChange("name")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-phone">Teléfono</FieldLabel>
            <Input
              id="customer-phone"
              placeholder="+54 ..."
              value={customer.phone}
              onChange={handleChange("phone")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-email">Email</FieldLabel>
            <Input
              id="customer-email"
              placeholder="email@ejemplo.com"
              value={customer.email || ""}
              onChange={handleChange("email")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-address">Dirección</FieldLabel>
            <Input
              id="customer-address"
              placeholder="Calle y altura"
              value={customer.address}
              onChange={handleChange("address")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-city">Ciudad</FieldLabel>
            <Input
              id="customer-city"
              placeholder="Localidad"
              value={customer.city}
              onChange={handleChange("city")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="customer-postal">Código Postal</FieldLabel>
            <Input
              id="customer-postal"
              placeholder="CPA"
              value={customer.postalCode}
              onChange={handleChange("postalCode")}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <FieldSeparator />
      <FieldSet>
        <FieldLegend>Estado de la Orden</FieldLegend>
        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Estado del Pago</FieldLabel>
            <div className="flex items-center space-x-2 mt-2">
              <Switch
                id="payment-status"
                checked={paymentStatus === "PAID"}
                onCheckedChange={(checked) =>
                  onPaymentStatusChange(checked ? "PAID" : "PENDING")
                }
              />
              <span
                className={
                  paymentStatus === "PAID"
                    ? "font-medium text-green-600"
                    : "text-muted-foreground"
                }
              >
                {paymentStatus === "PAID" ? "PAGADO" : "PENDIENTE"}
              </span>
            </div>
          </Field>

          <Field>
            <FieldLabel>Estado de Envío</FieldLabel>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={wasShipped ? "default" : "secondary"}>
                {wasShipped ? "ENVIADO" : "PENDIENTE DE ENVÍO"}
              </Badge>
              {wasShipped && shipmentDate && (
                <span className="text-sm text-muted-foreground">
                  el {format(shipmentDate, "dd/MM/yyyy", { locale: es })}
                </span>
              )}
            </div>
          </Field>

          <Field>
            <FieldLabel>Facturación</FieldLabel>
            <div className="mt-2">
              <Badge variant="outline">{invoiceStatus}</Badge>
            </div>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel htmlFor="observations">Observaciones</FieldLabel>
            <Textarea
              id="observations"
              placeholder="Notas internas sobre la orden..."
              value={observations || ""}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onObservationsChange(e.target.value)
              }
              className="resize-none h-24"
            />
          </Field>
        </FieldGroup>
      </FieldSet>
    </FieldGroup>
  );
}
