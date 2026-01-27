import { data } from "react-router";
import { Form, useNavigation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { Route } from "./+types/upload";
import { Spinner } from "~/components/ui/spinner";
import { pipe, Stream, Effect, Console } from "effect";
import type { ProductCsvRow } from "~/types/product-csv-row";
import { parseCsvLine } from "~/lib/parse-csv-line";
import { mapProductCsvRow } from "~/lib/map-product-csv-row";
import { FUSE_INDEX_NAME, PRODUCTS_NAME } from "~/constants";
import Fuse from "fuse.js";

type FuseIndexProduct = Pick<ProductCsvRow, "codigo" | "producto">;

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const file = formData.get("file");
  const skipRowsNumber = Number(formData.get("skipRows") || 0);

  if (!file || !(file instanceof File)) {
    return data({ success: false, error: "No file uploaded" }, { status: 400 });
  }

  const bucket = context.cloudflare.env.fuse_dux;
  const decoder = new TextDecoder("utf-8");
  const encoder = new TextEncoder();

  const program = pipe(
    Stream.fromReadableStream(
      () => file.stream(),
      (e) => new Error("Failed to parse CSV", { cause: e }),
    ),
    Stream.map((chunk) => decoder.decode(chunk)),
    Stream.splitLines,
    Stream.drop(skipRowsNumber),
    Stream.map(parseCsvLine),
    Stream.map(mapProductCsvRow),
    Stream.broadcast(2, 64),
    Stream.flatMap(([toR2Stream, toFuseStream]) =>
      Effect.gen(function* () {
        const readableStream = Stream.toReadableStream(
          toR2Stream.pipe(
            Stream.map((product) => encoder.encode(JSON.stringify(product))),
          ),
        );

        yield* Effect.tryPromise({
          try: () =>
            bucket.put(PRODUCTS_NAME, readableStream, {
              httpMetadata: { contentType: "application/json" },
            }),
          catch: (e) => new Error("Failed to save products", { cause: e }),
        });

        yield* pipe(
          toFuseStream,
          Stream.runFold(
            [] as Array<FuseIndexProduct>,
            (acc, { codigo, producto }) => {
              acc.push({ codigo, producto });
              return acc;
            },
          ),
          Effect.flatMap((products) =>
            Effect.try({
              try: () => Fuse.createIndex(["codigo", "producto"], products),
              catch: (e) =>
                new Error("Failed to create fuse index", { cause: e }),
            }),
          ),
          Effect.flatMap((fuseIndex) =>
            Effect.tryPromise({
              try: () =>
                bucket.put(FUSE_INDEX_NAME, JSON.stringify(fuseIndex), {
                  httpMetadata: { contentType: "application/json" },
                }),
              catch: (e) =>
                new Error("Failed to save fuse index", { cause: e }),
            }),
          ),
        );
      }),
    ),
    Stream.runDrain,
  );

  return await pipe(
    program,
    Effect.tap(() => Console.log("Program finished")),
    Effect.tapError((e) => Console.error("Program failed", e)),
    Effect.match({
      onSuccess: () => data({ error: undefined, success: true }),
      onFailure: (error) => data({ error, success: false }),
    }),
    Effect.scoped,
    Effect.runPromise,
  );
}

export default function UploadRoute({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";

  console.log(actionData);

  return (
    <Dialog open={true} onOpenChange={(open) => !open && navigate("..")}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subir CSV</DialogTitle>
          <DialogDescription>
            Selecciona un archivo CSV que cumpla con el formato para subirlo al
            sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <p className="font-semibold mb-2">
            Importante: El orden de las columnas debe ser:
          </p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <span className="font-semibold">
                Código, Producto, 1) EF/TRANS
              </span>
            </li>
            <li>
              <span className="font-semibold">
                CRED/ DEB/ QR, CREDITO 3 PAGOS, CREDITO 6 CUOTAS
              </span>
            </li>
            <li className="text-yellow-700 dark:text-yellow-300/80 text-xs mt-1">
              ...y el resto de campos (HOT SALE, MAYORISTA, etc)
            </li>
          </ul>
          <div className="mt-3">
            <a
              href="/sample.csv"
              download="ejemplo_carga.csv"
              className="text-sm font-medium underline text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100 block"
            >
              Descargar CSV de ejemplo
            </a>
          </div>
        </div>

        <Form method="post" encType="multipart/form-data" className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">CSV</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept=".csv"
              required
              className="cursor-pointer"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skipRows">Saltar filas</Label>
            <Input
              id="skipRows"
              name="skipRows"
              type="number"
              defaultValue={0}
              required
              className="cursor-pointer"
            />
          </div>

          <Button
            type="submit"
            className={`w-full ${actionData?.success ? "bg-green-500" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Subiendo...
              </>
            ) : actionData?.success ? (
              "Archivo subido exitosamente"
            ) : (
              "Subir archivo"
            )}
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
