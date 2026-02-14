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
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { AVAILABLE_ORDER_FIELDS } from "~/types/order-field-mapping";
import { Badge } from "../ui/badge";
import { Delete, PlusIcon, Trash, Trash2 } from "lucide-react";

type TemplateData = {
  name: string;
  headers: string;
  fields: string;
};

const defaultMetadataTemplate: TemplateData = {
  name: "",
  headers: "",
  fields: "",
};

const joinFields = (fields: string[]) =>
  fields.filter((f) => f.trim() !== "").join(", ");

const splitFields = (fields: string) =>
  fields
    .split(",")
    .map((f) => f.trim())
    .filter((f) => f !== "");

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
          <Trash2 />
        </Button>
        <Button type="button" variant="outline" onClick={setCreateMode}>
          <PlusIcon />
        </Button>
      </div>
    </Field>
  );
}

interface NewTemplateFormProps {
  newTemplateName: string;
  isCancelDisabled: boolean;
  handleChangeNewTemplateName: (name: string) => void;
  setSelectorMode: () => void;
}

function NewTemplateForm({
  newTemplateName,
  isCancelDisabled,
  setSelectorMode,
  handleChangeNewTemplateName,
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
          variant="destructive"
          disabled={isCancelDisabled}
          onClick={setSelectorMode}
        >
          Cancelar
        </Button>
      </div>
    </Field>
  );
}

interface Props {
  formConfigConstants: ConfigConstants;
  setFormConfigConstants: Dispatch<SetStateAction<ConfigConstants>>;
}

export function LogisticMetadataTemplatesFields({
  formConfigConstants,
  setFormConfigConstants,
}: Props) {
  const formTemplates = formConfigConstants.logisticMetadataTemplates;

  const indexedTemplates = Object.fromEntries(
    formTemplates.map((template) => [template.name, template]),
  );
  const templateKeys = Object.keys(indexedTemplates);

  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(
    templateKeys.length ? templateKeys[0] : null,
  );

  const selectedTemplate = selectedTemplateKey
    ? indexedTemplates[selectedTemplateKey]
    : null;

  console.log({ selectedTemplate });

  const [templateDraft, setTemplateDraft] = useState<TemplateData>(
    selectedTemplate
      ? {
          name: selectedTemplate.name,
          headers: joinFields(selectedTemplate.headers),
          fields: joinFields(selectedTemplate.fields),
        }
      : defaultMetadataTemplate,
  );

  const isCreateMode =
    templateKeys.length === 0 || selectedTemplateKey === null;

  const isSaveDisabled =
    !templateDraft.name || splitFields(templateDraft.fields).length === 0;

  function handleChangeTemplateData(field: keyof TemplateData, value: string) {
    setTemplateDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectTemplate(templateKey: string | null) {
    setSelectedTemplateKey(templateKey);
    const selectedTemplate = templateKey ? indexedTemplates[templateKey] : null;
    setTemplateDraft(
      selectedTemplate
        ? {
            ...selectedTemplate,
            headers: joinFields(selectedTemplate.headers),
            fields: joinFields(selectedTemplate.fields),
          }
        : defaultMetadataTemplate,
    );
  }

  function setFormTemplates(
    templates: ConfigConstants["logisticMetadataTemplates"],
  ) {
    setFormConfigConstants((prev) => ({
      ...prev,
      logisticMetadataTemplates: templates,
    }));
  }

  function handleSaveTemplate() {
    const newTemplate = {
      ...templateDraft,
      headers: splitFields(templateDraft.headers),
      fields: splitFields(templateDraft.fields),
    };

    const newIndexedTemplates = { ...indexedTemplates };

    if (selectedTemplateKey && selectedTemplateKey !== templateDraft.name) {
      delete newIndexedTemplates[selectedTemplateKey];
    }

    newIndexedTemplates[templateDraft.name] = newTemplate;

    setFormTemplates(Object.values(newIndexedTemplates));
    handleSelectTemplate(templateDraft.name);
  }

  function handleDeleteTemplate() {
    if (!selectedTemplateKey) return;
    setFormTemplates(
      formTemplates.filter((t) => t.name !== selectedTemplateKey),
    );
    setSelectedTemplateKey(null);
  }

  return (
    <FieldSet className="p-2">
      <FieldLegend>Metadatos Logística</FieldLegend>
      <FieldDescription>
        Configura plantillas de metadatos para distintas logísticas.
      </FieldDescription>

      <FieldGroup>
        {isCreateMode ? (
          <NewTemplateForm
            newTemplateName={templateDraft.name}
            isCancelDisabled={formTemplates.length === 0}
            handleChangeNewTemplateName={(name) =>
              handleChangeTemplateData("name", name)
            }
            setSelectorMode={() =>
              handleSelectTemplate(templateKeys[0] ?? null)
            }
          />
        ) : (
          <TemplateSelector
            selectedTemplateIndex={selectedTemplateKey}
            templates={formTemplates}
            setSelectedTemplateIndex={handleSelectTemplate}
            setCreateMode={() => handleSelectTemplate(null)}
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
            value={templateDraft.headers}
            onChange={(e) =>
              handleChangeTemplateData("headers", e.target.value)
            }
            placeholder="Ej: Peso (kg), Largo (cm), Ancho (cm)"
          />
        </Field>
        <Field>
          <FieldLabel>Campos (separados por coma)</FieldLabel>
          <Input
            value={templateDraft.fields}
            onChange={(e) => handleChangeTemplateData("fields", e.target.value)}
            placeholder="Ej: peso, largo, ancho"
          />
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
        </Field>
        <Button
          type="button"
          disabled={isSaveDisabled}
          variant={"outline"}
          onClick={handleSaveTemplate}
        >
          Guardar Plantillas
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}
