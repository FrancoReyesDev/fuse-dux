import { data, useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Spinner } from "~/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Chunk, Console, Effect, pipe, Stream } from "effect";
import { parseCsvLine } from "~/lib/parse-csv-line";
import { mapProductCsvRow } from "~/lib/map-product-csv-row";
import { FUSE_INDEX_NAME, PRODUCTS_NAME } from "~/constants";
import type { FuseIndexProduct } from "~/types/fuse-index-product";
import Fuse from "fuse.js";
import type { Route } from "./+types/upload";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const file = formData.get("file");
  const skipRowsNumber = Number(formData.get("skipRows") || 0);

  if (!file || !(file instanceof File)) {
    return data({ success: false, error: "No file uploaded" }, { status: 400 });
  }

  const bucket = context.cloudflare.env.fuse_dux_bucket;
  const decoder = new TextDecoder("utf-8");

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
      Effect.all(
        [
          Effect.gen(function* () {
            const ndjson = yield* pipe(
              toR2Stream,
              Stream.mapEffect((row) =>
                Effect.try({
                  try: () => JSON.stringify(row),
                  catch: (error) =>
                    new Error("Failed to parse row", { cause: error }),
                }),
              ),
              Stream.runCollect,
              Effect.map(Chunk.toArray),
              Effect.map((lines) => lines.join("\n")),
            );

            yield* Effect.tryPromise({
              try: () =>
                bucket.put(PRODUCTS_NAME, ndjson, {
                  httpMetadata: { contentType: "application/x-ndjson" },
                }),
              catch: (e) => new Error("Failed to save products", { cause: e }),
            });
          }),
          Effect.gen(function* () {
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
        ],
        { concurrency: "unbounded" },
      ),
    ),
    Stream.runDrain,
  );

  const response = await pipe(
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

  return response;
}

export default function Settings() {
  const uploadFetcher = useFetcher();
  const isUploading = uploadFetcher.state === "submitting";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargar Productos</CardTitle>
        <CardDescription>
          Sube el archivo CSV con la lista de precios actualizada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 mb-6">
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

        <uploadFetcher.Form
          method="post"
          encType="multipart/form-data"
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="file">Archivo CSV</Label>
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
            <Label htmlFor="skipRows">Filas a saltar</Label>
            <Input
              id="skipRows"
              name="skipRows"
              type="number"
              defaultValue={0}
              required
            />
          </div>

          <Button
            type="submit"
            className={`w-full ${
              uploadFetcher.data?.success ? "bg-green-500" : ""
            }`}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Spinner /> Subiendo...
              </>
            ) : uploadFetcher.data?.success ? (
              "Archivo subido exitosamente"
            ) : (
              "Subir archivo"
            )}
          </Button>
        </uploadFetcher.Form>
      </CardContent>
    </Card>
  );
}
