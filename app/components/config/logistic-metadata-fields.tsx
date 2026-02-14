import type {
  ConfigConstants,
  LogisticsMetadataTemplate,
} from "~/types/config-constants";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AVAILABLE_ORDER_FIELDS } from "~/types/order-field-mapping";
import { Badge } from "../ui/badge";
import { PlusIcon } from "lucide-react";

const defaultMetadataTemplate: LogisticsMetadataTemplate = {
  name: "",
  headers: [],
  fields: [],
};

interface TemplateSelectorProps {
  selectedTemplateIndex: string;
  setSelectedTemplateIndex: (index: string) => void;
  setCreateMode: () => void;
  handleDeleteTemplate: () => void;
  templates: ConfigConstants["logisticMetadataTemplates"];
}

function TemplateSelector({
  selectedTemplateIndex,
  setSelectedTemplateIndex,
  setCreateMode,
  handleDeleteTemplate,
  templates,
}: TemplateSelectorProps) {
  return (
    <Field>
      <FieldLabel>Logística</FieldLabel>
      <div className="flex gap-2">
        <Select
          value={selectedTemplateIndex}
          onValueChange={(value) => setSelectedTemplateIndex(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Seleccionar logística..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template, index) => (
              <SelectItem key={index} value={template.name}>
                {template.name || `Logística #${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteTemplate}
        >
          Eliminar
        </Button>
        <Button type="button" variant="outline" onClick={setCreateMode}>
          Nueva
        </Button>
      </div>
    </Field>
  );
}

interface NewTemplateFormProps {
  newTemplateName: string;
  isSaveDisabled: boolean;
  handleChangeNewTemplateName: (name: string) => void;
  setSelectorMode: () => void;
  handleSaveTemplate: () => void;
}

function NewTemplateForm({
  newTemplateName,
  isSaveDisabled,
  handleChangeNewTemplateName,
  setSelectorMode,
  handleSaveTemplate,
}: NewTemplateFormProps) {
  return (
    <Field>
      <FieldLabel>Nombre Logística</FieldLabel>
      <div className="flex gap-2">
        <Input
          value={newTemplateName}
          onChange={(e) => handleChangeNewTemplateName(e.target.value)}
          placeholder="Ej: Redshift"
        />
        <Button
          type="button"
          variant="outline"
          disabled={isSaveDisabled}
          onClick={handleSaveTemplate}
        >
          Guardar
        </Button>
        <Button type="button" variant="destructive" onClick={setSelectorMode}>
          Cancelar
        </Button>
      </div>
    </Field>
  );
}

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

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string>(
    templateKeys.length ? templateKeys[0] : "",
  );

  console.log({ selectedTemplateKey, templateKeys, indexedTemplates });

  const selectedTemplate = indexedTemplates[selectedTemplateKey];

  const [createNewTemplate, setCreateNewTemplate] = useState(false);

  const [newTemplate, setNewTemplate] = useState<LogisticsMetadataTemplate>({
    ...defaultMetadataTemplate,
  });

  useEffect(() => {
    setNewTemplate({ ...defaultMetadataTemplate });
  }, [createNewTemplate]);

  const isCreateMode = createNewTemplate || formTemplates.length === 0;

  const templateData = isCreateMode
    ? newTemplate
    : (selectedTemplate ?? defaultMetadataTemplate);

  function handleChangeTemplateData(
    field: keyof LogisticsMetadataTemplate,
    value: string,
  ) {
    const finalValue =
      field === "headers" || field === "fields"
        ? value
            .split(",")
            .filter((s) => s.trim() !== "")
            .map((s) => s.trim())
        : value;

    if (isCreateMode) {
      setNewTemplate({ ...newTemplate, [field]: finalValue });
    } else {
      const newTemplate = { ...selectedTemplate, [field]: finalValue };
      const newIndexedTemplates = {
        ...indexedTemplates,
        [selectedTemplateKey]: newTemplate,
      };
      setFormTemplates(Object.values(newIndexedTemplates));
    }
  }

  function handleDeleteTemplate() {
    const { [selectedTemplateKey]: _, ...rest } = indexedTemplates;
    const remaining = Object.values(rest);
    setFormTemplates(remaining);
    if (remaining.length === 0) {
      setNewTemplate({ ...defaultMetadataTemplate });
    }
    const remainingKeys = Object.keys(rest);
    setSelectedTemplateKey(remainingKeys.length ? remainingKeys[0] : "");
  }

  function handleSaveTemplate() {
    const syncedHeaders = newTemplate.fields.map((field, i) => {
      const header = newTemplate.headers[i];
      return header && header.trim() !== "" ? header : field;
    });

    const templateToSave = {
      ...newTemplate,
      headers: syncedHeaders,
    };

    const newIndexedTemplates = {
      ...indexedTemplates,
      [templateToSave.name]: templateToSave,
    };
    setFormTemplates(Object.values(newIndexedTemplates));
    setCreateNewTemplate(false);
    setSelectedTemplateKey(templateToSave.name);
  }

  return (
    <FieldSet>
      <FieldLegend>Metadatos Logística</FieldLegend>
      <FieldDescription>
        Configura plantillas de metadatos para distintas logísticas.
      </FieldDescription>

      <FieldGroup>
        {isCreateMode ? (
          <NewTemplateForm
            newTemplateName={newTemplate.name}
            isSaveDisabled={
              !newTemplate.name ||
              newTemplate.fields.filter((f) => f.trim() !== "").length === 0
            }
            handleChangeNewTemplateName={(name) =>
              handleChangeTemplateData("name", name)
            }
            setSelectorMode={() => setCreateNewTemplate(false)}
            handleSaveTemplate={handleSaveTemplate}
          />
        ) : (
          <TemplateSelector
            selectedTemplateIndex={selectedTemplateKey}
            templates={formTemplates}
            setSelectedTemplateIndex={setSelectedTemplateKey}
            setCreateMode={() => setCreateNewTemplate(true)}
            handleDeleteTemplate={handleDeleteTemplate}
          />
        )}
        <Field>
          <FieldLabel>Encabezados (separados por coma)</FieldLabel>
          <FieldDescription>
            Define los nombres de las columnas en el CSV. El orden debe
            coincidir con los campos de abajo.
          </FieldDescription>
          <Input
            value={templateData.headers?.join(", ") || ""}
            onChange={(e) =>
              handleChangeTemplateData("headers", e.target.value)
            }
            placeholder="Ej: Peso (kg), Largo (cm), Ancho (cm)"
          />
        </Field>
        <Field>
          <FieldLabel>Campos (separados por coma)</FieldLabel>
          <Input
            value={templateData.fields.join(", ")}
            onChange={(e) => handleChangeTemplateData("fields", e.target.value)}
            placeholder="Ej: peso, largo, ancho"
          />
          <div className="mt-2">
            <FieldDescription className="mb-2">
              Campos disponibles de la orden (se completarán automáticamente si
              coinciden):
            </FieldDescription>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ORDER_FIELDS.map((field) => (
                <Badge key={field} variant="secondary" className="text-xs">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
