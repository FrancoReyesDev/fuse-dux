import type { ConfigConstants } from "~/types/config-constants";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { stringToFloat } from "~/utils/string-to-float";
import { Effect, pipe } from "effect";

interface Props {
  formConfigConstants: ConfigConstants;
  setFormConfigConstants: (config: ConfigConstants) => void;
}

export function CalculatorFactorsFields({
  formConfigConstants: config,
  setFormConfigConstants,
}: Props) {
  const [calculatorFactors, setCalculatorFactors] = useState<
    Record<keyof ConfigConstants["factors"], string>
  >({
    profitFactorOptions: config.factors.profitFactorOptions.join(", "),
    creditCardFactor: config.factors.creditCardFactor.toString(),
    threeInstallmentsFactor: config.factors.threeInstallmentsFactor.toString(),
  });

  useEffect(() => {
    Effect.gen(function* () {
      if (
        calculatorFactors.profitFactorOptions.trim() === "" ||
        calculatorFactors.creditCardFactor.trim() === "" ||
        calculatorFactors.threeInstallmentsFactor.trim() === ""
      )
        return;

      const profitFactorOptions = yield* pipe(
        calculatorFactors.profitFactorOptions
          .trim()
          .split(",")
          .filter((option) => option !== ""),
        Effect.forEach((option) => stringToFloat(option)),
      );
      const creditCardFactor = yield* stringToFloat(
        calculatorFactors.creditCardFactor,
      );
      const threeInstallmentsFactor = yield* stringToFloat(
        calculatorFactors.threeInstallmentsFactor,
      );

      setFormConfigConstants({
        ...config,
        factors: {
          profitFactorOptions,
          creditCardFactor,
          threeInstallmentsFactor,
        },
      });
    }).pipe(Effect.runSync);
  }, [calculatorFactors]);

  const handleCalculatorFactorsChange =
    (key: keyof ConfigConstants["factors"]) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCalculatorFactors({
        ...calculatorFactors,
        [key]: event.target.value,
      });
    };

  return (
    <FieldSet>
      <FieldLegend>Factores para calculador</FieldLegend>
      <FieldDescription>
        Ingresa los factores de tarjeta y los factores de ganancia separados por
        comas para usarlos en el calculador.
      </FieldDescription>
      <FieldGroup className="grid grid-cols-3 gap-4">
        <Field>
          <FieldLabel htmlFor="ganancia">Factores de Ganancia</FieldLabel>
          <FieldContent>
            <Input
              id="ganancia"
              name="ganancia"
              placeholder="1.3, 1.5, 1.8"
              value={calculatorFactors.profitFactorOptions}
              onChange={handleCalculatorFactorsChange("profitFactorOptions")}
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
              value={calculatorFactors.creditCardFactor}
              onChange={handleCalculatorFactorsChange("creditCardFactor")}
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
              value={calculatorFactors.threeInstallmentsFactor}
              onChange={handleCalculatorFactorsChange(
                "threeInstallmentsFactor",
              )}
            />
          </FieldContent>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
