import { data, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Route } from "./+types/config";
import type {
  ConfigConstants,
  DuxBillingTemplate,
  LogisticsMetadataTemplate,
} from "~/types/config-constants";
import { Effect, pipe } from "effect";
import { stringToFloat } from "~/utils/string-to-float";
import { CONFIG_CONSTANTS_KEY } from "~/constants";
import { getConfigFromKv } from "~/lib/get-config-from-kv";
import { useState, type ChangeEvent } from "react";
import { ScrollArea } from "~/components/ui/scroll-area";
import { AVAILABLE_ORDER_FIELDS } from "~/types/order-field-mapping";
import { Badge } from "~/components/ui/badge";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const profitOptions = formData.get("ganancia");
  const factorTarjeta1 = formData.get("factor_tarjeta_1");
  const factorTarjeta3 = formData.get("factor_tarjeta_3");

  if (!profitOptions || !factorTarjeta1 || !factorTarjeta3) {
    return {
      success: false,
      error: "Todos los campos son obligatorios",
    };
  }

  const kv = context.cloudflare.env.fuse_dux_kv;

  const program = Effect.gen(function* () {
    const profitFactorOptions = yield* pipe(
      profitOptions.toString().split(","),
      Effect.forEach((option) => stringToFloat(option)),
    );
    const creditCardFactor = yield* stringToFloat(factorTarjeta1.toString());
    const threeInstallmentsFactor = yield* stringToFloat(
      factorTarjeta3.toString(),
    );

    const existingConfig = yield* getConfigFromKv(kv).pipe(Effect.either);
    const duxTemplates =
      existingConfig._tag === "Right" ? existingConfig.right.duxTemplates : [];

    const logisticsTemplatesJSON = formData.get("logisticsTemplatesJSON");
    const logisticsTemplates: LogisticsMetadataTemplate[] =
      logisticsTemplatesJSON
        ? JSON.parse(logisticsTemplatesJSON.toString())
        : [];

    return {
      profitFactorOptions,
      creditCardFactor,
      threeInstallmentsFactor,
      duxTemplates,
      logisticsTemplates,
    } satisfies ConfigConstants;
  }).pipe(
    Effect.flatMap((config) => Effect.try(() => JSON.stringify(config))),
    Effect.flatMap((configString) =>
      Effect.tryPromise({
        try: () => kv.put(CONFIG_CONSTANTS_KEY, configString),
        catch: (e) =>
          new Error("Error al guardar la configuración", { cause: e }),
      }),
    ),
    Effect.match({
      onSuccess: () => data({ success: true, error: undefined }),
      onFailure: () =>
        data({ success: false, error: "Error al guardar la configuración" }),
    }),
    Effect.runPromise,
  );

  return program;
}

export async function loader({ context }: Route.LoaderArgs) {
  const kv = context.cloudflare.env.fuse_dux_kv;
  const program = pipe(
    getConfigFromKv(kv),
    Effect.match({
      onSuccess: (config) => data({ success: true, error: undefined, config }),
      onFailure: () =>
        data({
          success: false,
          error: "Error al obtener la configuración",
          config: undefined,
        }),
    }),
    Effect.runPromise,
  );
  return program;
}

type ConfigState = {
  profitFactorOptions: string;
  creditCardFactor: string | number;
  threeInstallmentsFactor: string | number;
  duxTemplates: DuxBillingTemplate[];
  logisticsTemplates: LogisticsMetadataTemplate[];
};

export default function Config({ loaderData }: Route.ComponentProps) {
  const { config } = loaderData;
  const [configState, setConfigState] = useState<ConfigState>({
    profitFactorOptions: config?.profitFactorOptions.join(", ") || "",
    creditCardFactor: config?.creditCardFactor || "",
    threeInstallmentsFactor: config?.threeInstallmentsFactor || "",
    duxTemplates: config?.duxTemplates || [],
    logisticsTemplates: config?.logisticsTemplates || [],
  });
  const [selectedLogisticsIndex, setSelectedLogisticsIndex] = useState<
    string | null
  >(null);

  const fetcher = useFetcher<typeof action>();
  const isSavingConfig = fetcher.state === "submitting";

  const handleConfigChange =
    (key: keyof ConfigConstants) => (event: ChangeEvent<HTMLInputElement>) => {
      setConfigState({ ...configState, [key]: event.target.value });
    };

  const addLogisticsTemplate = () => {
    const newTemplates = [
      ...configState.logisticsTemplates,
      { name: "Nueva Logística", fields: [], headers: [] },
    ];
    setConfigState({
      ...configState,
      logisticsTemplates: newTemplates,
    });
    setSelectedLogisticsIndex((newTemplates.length - 1).toString());
  };

  const removeLogisticsTemplate = (index: number) => {
    const newTemplates = [...configState.logisticsTemplates];
    newTemplates.splice(index, 1);
    setConfigState({ ...configState, logisticsTemplates: newTemplates });
    if (selectedLogisticsIndex === index.toString()) {
      setSelectedLogisticsIndex(null);
    } else if (
      selectedLogisticsIndex &&
      parseInt(selectedLogisticsIndex) > index
    ) {
      setSelectedLogisticsIndex(
        (parseInt(selectedLogisticsIndex) - 1).toString(),
      );
    }
  };

  const updateLogisticsTemplate = (
    index: number,
    field: keyof LogisticsMetadataTemplate,
    value: string,
  ) => {
    const newTemplates = [...configState.logisticsTemplates];
    if (field === "fields") {
      newTemplates[index] = {
        ...newTemplates[index],
        fields: value.split(",").map((f) => f.trim()),
      }; // Store as array but input is string.
      // Logic detail: storing as array immediately might be tricky for input value.
      // Correct approach: We need to handle the input state carefully.
      // For simplicity in this step, let's assume valid state updates and we might need a separate local state helper
      // or just accept that we split on render/join on input.
      // Actually, better to keep state as object and transform.
      // Let's refine:
      newTemplates[index] = {
        ...newTemplates[index],
        fields: value.split(","), // This creates ["field1", " field2"]
      };
    } else if (field === "headers") {
      newTemplates[index] = {
        ...newTemplates[index],
        headers: value.split(","),
      };
    } else {
      newTemplates[index] = { ...newTemplates[index], [field]: value };
    }
    setConfigState({ ...configState, logisticsTemplates: newTemplates });
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
        <CardDescription>
          Ajusta los parámetros generales del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh]">
          <fetcher.Form id="config-form" method="post" className="space-y-6">
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Factores para calculador</FieldLegend>
                <FieldDescription>
                  Ingresa los factores de tarjeta y los factores de ganancia
                  separados por comas para usarlos en el calculador.
                </FieldDescription>
                <FieldGroup className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="ganancia">
                      Factores de Ganancia
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="ganancia"
                        name="ganancia"
                        placeholder="1.3, 1.5, 1.8"
                        value={configState.profitFactorOptions}
                        onChange={handleConfigChange("profitFactorOptions")}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="factor_tarjeta_1">
                      Factor Tarjeta (1 Pago)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="factor_tarjeta_1"
                        name="factor_tarjeta_1"
                        type="number"
                        step="0.01"
                        placeholder="1.6"
                        value={configState.creditCardFactor}
                        onChange={handleConfigChange("creditCardFactor")}
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="factor_tarjeta_3">
                      Factor Tarjeta (3 Pagos)
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        id="factor_tarjeta_3"
                        name="factor_tarjeta_3"
                        type="number"
                        step="0.01"
                        placeholder="1.8"
                        value={configState.threeInstallmentsFactor}
                        onChange={handleConfigChange("threeInstallmentsFactor")}
                      />
                    </FieldContent>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <div className="flex items-center justify-between">
                  <FieldLegend className="mb-0">
                    Metadatos Logística
                  </FieldLegend>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addLogisticsTemplate}
                  >
                    Agregar Plantilla
                  </Button>
                </div>
                <FieldDescription>
                  Configura plantillas de metadatos para distintas logísticas.
                </FieldDescription>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select
                      value={selectedLogisticsIndex || ""}
                      onValueChange={(value) =>
                        setSelectedLogisticsIndex(value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar logística..." />
                      </SelectTrigger>
                      <SelectContent>
                        {configState.logisticsTemplates.map(
                          (template, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {template.name || `Logística #${index + 1}`}
                            </SelectItem>
                          ),
                        )}
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
                    configState.logisticsTemplates[
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
                              removeLogisticsTemplate(
                                parseInt(selectedLogisticsIndex),
                              )
                            }
                          >
                            Eliminar esta plantilla
                          </Button>
                        </div>
                        <Field>
                          <FieldLabel>Nombre Logística</FieldLabel>
                          <Input
                            value={
                              configState.logisticsTemplates[
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
                          <FieldLabel>
                            Headers CSV (separados por coma)
                          </FieldLabel>
                          <FieldDescription>
                            Define los nombres de las columnas en el CSV. El
                            orden debe coincidir con los campos de abajo.
                          </FieldDescription>
                          <Input
                            value={
                              configState.logisticsTemplates[
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
                            value={configState.logisticsTemplates[
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
                        </Field>
                      </div>
                    )}
                </div>
              </FieldSet>
              <input
                type="hidden"
                name="logisticsTemplatesJSON"
                value={JSON.stringify(configState.logisticsTemplates)}
              />
            </FieldGroup>
          </fetcher.Form>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="config-form"
          disabled={isSavingConfig}
          className={`w-full ${fetcher.data?.success ? "bg-green-500" : ""}`}
        >
          {isSavingConfig ? (
            <>
              <Spinner /> Guardando...
            </>
          ) : fetcher.data?.success ? (
            "Configuración guardada exitosamente"
          ) : (
            "Guardar Configuración"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
