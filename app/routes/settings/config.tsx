import { data, useFetcher, type SubmitTarget } from "react-router";
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
import type {
  CategoriaFiscal,
  TipoCompCrear,
  TipoEntrega,
} from "~/types/dux-dto/post-factura-dto";
import { CalculatorFactorsFields } from "~/components/config/calculator-factors-fields";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.json<ConfigConstants>();
  const profitOptions = formData.factors.profitFactorOptions;
  const factorTarjeta1 = formData.factors.creditCardFactor;
  const factorTarjeta3 = formData.factors.threeInstallmentsFactor;

  console.log(formData);

  return;

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
    const duxTemplatesJSON = formData.get("duxTemplatesJSON");
    const duxTemplates: DuxBillingTemplate[] = duxTemplatesJSON
      ? JSON.parse(duxTemplatesJSON.toString())
      : existingConfig._tag === "Right"
        ? existingConfig.right.duxBillingTemplates
        : [];

    const logisticsTemplatesJSON = formData.get("logisticsTemplatesJSON");
    const logisticsTemplates: LogisticsMetadataTemplate[] =
      logisticsTemplatesJSON
        ? JSON.parse(logisticsTemplatesJSON.toString())
        : existingConfig._tag === "Right"
          ? existingConfig.right.logisticMetadataTemplates
          : [];

    return {
      factors: {
        profitFactorOptions,
        creditCardFactor,
        threeInstallmentsFactor,
      },
      duxBillingTemplates: duxTemplates,
      logisticMetadataTemplates: logisticsTemplates,
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
      onSuccess: (configConstants) =>
        data({ success: true, error: undefined, configConstants }),
      onFailure: () =>
        data({
          success: false,
          error: "Error al obtener la configuración",
          configConstants: undefined,
        }),
    }),
    Effect.runPromise,
  );
  return program;
}

//  profitFactorOptions: [ 1.2, 1.3, 1.5 ],
//   creditCardFactor: 1.08,
//   threeInstallmentsFactor: 1.16

const configConstantsDefualt: ConfigConstants = {
  factors: {
    profitFactorOptions: [],
    creditCardFactor: 0,
    threeInstallmentsFactor: 0,
  },
  duxBillingTemplates: [],
  logisticMetadataTemplates: [],
};

export default function Config({ loaderData }: Route.ComponentProps) {
  const { configConstants } = loaderData;
  const [formConfigConstants, setFormConfigConstants] =
    useState<ConfigConstants>(configConstantsDefualt);

  const fetcher = useFetcher<typeof action>();
  const isSavingConfig = fetcher.state === "submitting";

  function handleSubmit() {
    fetcher.submit(formConfigConstants as unknown as SubmitTarget, {
      method: "POST",
      encType: "application/json",
    });
  }

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
          <FieldGroup>
            <CalculatorFactorsFields
              formConfigConstants={formConfigConstants}
              setFormConfigConstants={setFormConfigConstants}
            />
          </FieldGroup>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubmit}
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
