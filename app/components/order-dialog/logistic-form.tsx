import type { ConfigConstants } from "~/types/config-constants";
import type { Order } from "~/types/order";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { AVAILABLE_ORDER_FIELDS } from "~/types/order-field-mapping";
import { mapOrderToField } from "~/utils/order-mapper";

interface LogisticFormProps {
  order: Order;
  config: ConfigConstants;
  onUpdateMetadata: (
    metadata: Record<string, string | number | boolean>,
  ) => void;
}

export function LogisticForm({
  order,
  config,
  onUpdateMetadata,
}: LogisticFormProps) {
  const templates = config.logisticMetadataTemplates;
  const selectedTemplateName =
    (order.shipmentMetadata?._templateName as string) || "";
  const selectedTemplate = templates.find(
    (t) => t.name === selectedTemplateName,
  );

  const handleTemplateChange = (templateName: string) => {
    // Just update the template name. The fields will be calculated on render.
    // We preserve existing metadata to not lose manual entries if switching back and forth.
    const newMetadata = {
      ...(order.shipmentMetadata || {}),
      _templateName: templateName,
    };
    onUpdateMetadata(newMetadata);
  };

  const handleInputChange = (field: string, value: string) => {
    const newMetadata = {
      ...(order.shipmentMetadata || {}),
      [field]: value,
    };
    onUpdateMetadata(newMetadata);
  };

  if (templates.length === 0) {
    return (
      <div className="p-4 text-muted-foreground">
        No hay plantillas de logística configuradas.
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="space-y-2">
        <Label>Seleccionar Logística</Label>
        <Select
          value={selectedTemplateName}
          onValueChange={handleTemplateChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione una plantilla..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t) => (
              <SelectItem key={t.name} value={t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && (
        <div className="grid gap-4 py-4">
          {selectedTemplate.fields.map((field, index) => {
            const fieldKey = field.trim();
            const header = selectedTemplate.headers?.[index] || fieldKey;
            const isAutoFilled = AVAILABLE_ORDER_FIELDS.includes(fieldKey);

            // Calculate value on render
            const rawValue = isAutoFilled
              ? mapOrderToField(order, fieldKey)
              : (order.shipmentMetadata?.[fieldKey] ?? "");

            const value =
              typeof rawValue === "boolean" ? String(rawValue) : rawValue;

            return (
              <div
                key={fieldKey}
                className="grid grid-cols-4 items-center gap-4"
              >
                <Label htmlFor={fieldKey} className="text-right">
                  {header}
                </Label>
                <Input
                  id={fieldKey}
                  value={value}
                  onChange={(e) =>
                    !isAutoFilled && handleInputChange(fieldKey, e.target.value)
                  }
                  className="col-span-3"
                  disabled={isAutoFilled}
                />
                {isAutoFilled && (
                  <p className="text-xs text-muted-foreground col-start-2 col-span-3">
                    Autocompletdo desde la orden
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
