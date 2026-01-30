import { data, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
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
import type { ConfigConstants } from "~/types/config-constants";
import { Effect, pipe } from "effect";
import { stringToFloat } from "~/utils/string-to-float";
import { CONFIG_CONSTANTS_KEY } from "~/constants";
import { getConfigFromKv } from "~/lib/get-config-from-kv";
import { useState, type ChangeEvent } from "react";

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

    return {
      profitFactorOptions,
      creditCardFactor,
      threeInstallmentsFactor,
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

type ConfigState = Record<keyof ConfigConstants, string | number>;

export default function Config({ loaderData }: Route.ComponentProps) {
  const { config } = loaderData;
  const [configState, setConfigState] = useState<ConfigState>({
    profitFactorOptions: config?.profitFactorOptions.join(", ") || "",
    creditCardFactor: config?.creditCardFactor || "",
    threeInstallmentsFactor: config?.threeInstallmentsFactor || "",
  });
  const fetcher = useFetcher<typeof action>();
  const isSavingConfig = fetcher.state === "submitting";

  const handleConfigChange =
    (key: keyof ConfigConstants) => (event: ChangeEvent<HTMLInputElement>) => {
      setConfigState({ ...configState, [key]: event.target.value });
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
        <fetcher.Form id="config-form" method="post" className="space-y-6">
          <Field>
            <FieldLabel htmlFor="ganancia">Factores de Ganancia</FieldLabel>
            <FieldContent>
              <Input
                id="ganancia"
                name="ganancia"
                placeholder="1.3, 1.5, 1.8"
                value={configState.profitFactorOptions}
                onChange={handleConfigChange("profitFactorOptions")}
              />
              <FieldDescription>
                Ingresa los factores separados por comas para usarlos en el
                calculador.
              </FieldDescription>
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
        </fetcher.Form>
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
