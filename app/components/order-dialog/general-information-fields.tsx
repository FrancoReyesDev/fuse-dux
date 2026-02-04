import { Truck } from "lucide-react";
import type { ShipmentMetadata } from "~/types/order";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";

import { User } from "lucide-react";
import type { Customer } from "~/types/order";

interface CustomerFieldsProps {
  customer: Customer;
  onCustomerChange: (customer: Customer) => void;
}

function CustomerFields({ customer, onCustomerChange }: CustomerFieldsProps) {
  const handleChange = (field: keyof Customer, value: string) => {
    onCustomerChange({ ...customer, [field]: value });
  };

  return (
    <FieldSet className="bg-muted/30 p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <User className="size-5" />
        <FieldLegend className="text-lg font-semibold">
          Datos del Cliente
        </FieldLegend>
      </div>

      <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field>
          <FieldLabel htmlFor="customer-name">Nombre Completo</FieldLabel>
          <Input
            id="customer-name"
            placeholder="Nombre del cliente"
            value={customer.name}
            onChange={(e) => handleChange("name", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-phone">Teléfono</FieldLabel>
          <Input
            id="customer-phone"
            placeholder="+54 ..."
            value={customer.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-email">Email</FieldLabel>
          <Input
            id="customer-email"
            placeholder="email@ejemplo.com"
            value={customer.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-address">Dirección</FieldLabel>
          <Input
            id="customer-address"
            placeholder="Calle y altura"
            value={customer.address}
            onChange={(e) => handleChange("address", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-city">Ciudad</FieldLabel>
          <Input
            id="customer-city"
            placeholder="Localidad"
            value={customer.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="customer-postal">Código Postal</FieldLabel>
          <Input
            id="customer-postal"
            placeholder="CPA"
            value={customer.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
          />
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

interface MetadataFieldsProps {
  metadata: ShipmentMetadata;
  paymentMethod: string;
  onMetadataChange: (metadata: ShipmentMetadata) => void;
  onPaymentMethodChange: (method: string) => void;
}

function MetadataFields({
  metadata,
  paymentMethod,
  onMetadataChange,
  onPaymentMethodChange,
}: MetadataFieldsProps) {
  const handleChange = (field: keyof ShipmentMetadata, value: any) => {
    onMetadataChange({ ...metadata, [field]: value });
  };

  return (
    <FieldSet className="bg-muted/30 p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-4 text-primary">
        <Truck className="size-5" />
        <FieldLegend className="text-lg font-semibold">
          Logística y Metadatos
        </FieldLegend>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <FieldGroup className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field>
            <FieldLabel htmlFor="tracking">Tracking Number</FieldLabel>
            <Input
              id="tracking"
              value={metadata.trackingNumber}
              onChange={(e) => handleChange("trackingNumber", e.target.value)}
              placeholder="Ej: AA123456789"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="weight">Peso Declarado (Kg)</FieldLabel>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={metadata.declaredWeight || ""}
              onChange={(e) =>
                handleChange("declaredWeight", Number(e.target.value))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="value">Valor Declarado ($)</FieldLabel>
            <Input
              id="value"
              type="number"
              step="0.01"
              value={metadata.declaredValue || ""}
              onChange={(e) =>
                handleChange("declaredValue", Number(e.target.value))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="collect">Total a Cobrar ($)</FieldLabel>
            <Input
              id="collect"
              type="number"
              step="0.01"
              value={metadata.totalToCollect || ""}
              onChange={(e) =>
                handleChange("totalToCollect", Number(e.target.value))
              }
            />
          </Field>
          <Field className="md:col-span-2">
            <FieldLabel htmlFor="notes">Notas de Envío</FieldLabel>
            <Input
              id="notes"
              value={metadata.shipmentNotes || ""}
              onChange={(e) => handleChange("shipmentNotes", e.target.value)}
              placeholder="Instrucciones para el correo..."
            />
          </Field>
        </FieldGroup>

        <div className="flex flex-col gap-4 justify-center border-l pl-6">
          <Field
            orientation="horizontal"
            className="p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors"
          >
            <input
              id="inverse"
              type="checkbox"
              className="h-5 w-5 rounded border-primary text-primary focus:ring-primary mr-3"
              checked={metadata.inverseLogistics}
              onChange={(e) =>
                handleChange("inverseLogistics", e.target.checked)
              }
            />
            <FieldLabel
              htmlFor="inverse"
              className="font-medium cursor-pointer"
            >
              Logística Inversa
            </FieldLabel>
          </Field>

          <Field>
            <FieldLabel htmlFor="payment">Método de Pago</FieldLabel>
            <Input
              id="payment"
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              placeholder="Ej: Transferencia"
            />
          </Field>
        </div>
      </div>
    </FieldSet>
  );
}

interface Props extends CustomerFieldsProps, MetadataFieldsProps {}

export function GeneralInformationFields({
  customer,
  metadata,
  paymentMethod,
  onCustomerChange,
  onMetadataChange,
  onPaymentMethodChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <CustomerFields customer={customer} onCustomerChange={onCustomerChange} />
      <MetadataFields
        metadata={metadata}
        paymentMethod={paymentMethod}
        onMetadataChange={onMetadataChange}
        onPaymentMethodChange={onPaymentMethodChange}
      />
    </div>
  );
}
