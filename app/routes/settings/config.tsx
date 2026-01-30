import { Form, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "~/components/ui/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Route } from "./+types/config";

export async function action({ request }: Route.ActionArgs) {}

export async function loader({}: Route.LoaderArgs) {}

export default function Config() {
  const fetcher = useFetcher();
  const isSavingConfig = fetcher.state === "submitting";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración Global</CardTitle>
        <CardDescription>
          Ajusta los parámetros generales del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <fetcher.Form className="space-y-6">
          <Field>
            <FieldLabel htmlFor="ganancia">Factores de Ganancia</FieldLabel>
            <FieldContent>
              <Input
                id="ganancia"
                name="ganancia"
                placeholder="1.3, 1.5, 1.8"
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
              />
            </FieldContent>
          </Field>
        </fetcher.Form>
      </CardContent>
      <CardFooter>
        <Button type="submit" disabled={isSavingConfig} className="w-full">
          {isSavingConfig ? "Guardando..." : "Guardar Configuración"}
        </Button>
      </CardFooter>
    </Card>
  );
}
