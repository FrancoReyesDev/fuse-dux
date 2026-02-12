import type { ConfigConstants } from "~/types/config-constants";
import { FieldDescription, FieldLegend, FieldSet } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useState } from "react";
import { Button } from "../ui/button";

interface Props {
  formConfigConstants: ConfigConstants;
  setFormConfigConstants: (formConfigConstants: ConfigConstants) => void;
}

export function LogisticMetadataTemplatesFields({
  formConfigConstants,
  setFormConfigConstants,
}: Props) {
  const [formTemplates, setFormTemplates] = useState<
    ConfigConstants["logisticMetadataTemplates"]
  >(formConfigConstants.logisticMetadataTemplates);

  const indexedTemplates = Object.fromEntries(
    formTemplates.map((template) => [template.name, template]),
  );
  const templateKeys = Object.keys(indexedTemplates);

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<string>(
    templateKeys.length ? templateKeys[0] : "",
  );
  const selectedTemplate = indexedTemplates[selectedTemplateIndex];

  const [createNewTemplate, setCreateNewTemplate] = useState(false);

  return (
    <FieldSet>
      <FieldLegend>Metadatos Logística</FieldLegend>
      <FieldDescription>
        Configura plantillas de metadatos para distintas logísticas.
      </FieldDescription>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Select
            value={selectedLogisticsIndex || ""}
            onValueChange={(value) => setSelectedLogisticsIndex(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar logística..." />
            </SelectTrigger>
            <SelectContent>
              {formConfigConstants.logisticsTemplates.map((template, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {template.name || `Logística #${index + 1}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={addLogisticsTemplate}
          >
            Nueva
          </Button>
        </div>

        {selectedLogisticsIndex !== null &&
          formConfigConstants.logisticsTemplates[
            parseInt(selectedLogisticsIndex)
          ] && (
            <div className="grid grid-cols-1 gap-4 border p-4 rounded-md relative group">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() =>
                    removeLogisticsTemplate(parseInt(selectedLogisticsIndex))
                  }
                >
                  Eliminar esta plantilla
                </Button>
              </div>
              <Field>
                <FieldLabel>Nombre Logística</FieldLabel>
                <Input
                  value={
                    formConfigConstants.logisticsTemplates[
                      parseInt(selectedLogisticsIndex)
                    ].name
                  }
                  onChange={(e) =>
                    updateLogisticsTemplate(
                      parseInt(selectedLogisticsIndex),
                      "name",
                      e.target.value,
                    )
                  }
                  placeholder="Ej: Redshift"
                />
              </Field>
              <Field>
                <FieldLabel>Headers CSV (separados por coma)</FieldLabel>
                <FieldDescription>
                  Define los nombres de las columnas en el CSV. El orden debe
                  coincidir con los campos de abajo.
                </FieldDescription>
                <Input
                  value={
                    formConfigConstants.logisticsTemplates[
                      parseInt(selectedLogisticsIndex)
                    ].headers?.join(", ") || ""
                  }
                  onChange={(e) =>
                    updateLogisticsTemplate(
                      parseInt(selectedLogisticsIndex),
                      "headers",
                      e.target.value,
                    )
                  }
                  placeholder="Ej: Peso (kg), Largo (cm), Ancho (cm)"
                />
              </Field>
              <Field>
                <FieldLabel>Campos (separados por coma)</FieldLabel>
                <Input
                  value={formConfigConstants.logisticsTemplates[
                    parseInt(selectedLogisticsIndex)
                  ].fields.join(", ")}
                  onChange={(e) =>
                    updateLogisticsTemplate(
                      parseInt(selectedLogisticsIndex),
                      "fields",
                      e.target.value,
                    )
                  }
                  placeholder="Ej: peso, largo, ancho"
                />
                <div className="mt-2">
                  <FieldDescription className="mb-2">
                    Campos disponibles de la orden (se completarán
                    automáticamente si coinciden):
                  </FieldDescription>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ORDER_FIELDS.map((field) => (
                      <Badge
                        key={field}
                        variant="secondary"
                        className="text-xs"
                      >
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
                {formConfigConstants.logisticsTemplates[
                  parseInt(selectedLogisticsIndex)
                ].headers?.length !==
                  formConfigConstants.logisticsTemplates[
                    parseInt(selectedLogisticsIndex)
                  ].fields.length &&
                  formConfigConstants.logisticsTemplates[
                    parseInt(selectedLogisticsIndex)
                  ].headers?.length > 0 && (
                    <p className="text-secondary-foreground text-xs mt-2 font-medium">
                      ⚠️ Atención: Hay{" "}
                      {
                        formConfigConstants.logisticsTemplates[
                          parseInt(selectedLogisticsIndex)
                        ].headers.length
                      }{" "}
                      headers para{" "}
                      {
                        formConfigConstants.logisticsTemplates[
                          parseInt(selectedLogisticsIndex)
                        ].fields.length
                      }{" "}
                      campos.
                    </p>
                  )}
              </Field>
            </div>
          )}
      </div>
    </FieldSet>
  );
}
