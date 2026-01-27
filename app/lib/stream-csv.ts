import { pipe, Stream, Effect, Console } from "effect";
import { mapProductCsvRow } from "./map-product-csv-row";
import { parseCsvLine } from "./parse-csv-line";
import type { ProductCsvRow } from "../types/product-csv-row";

export const streamCsv = async (file: File, skipRowsNumber: number) => {
  const decoder = new TextDecoder("utf-8");

  return await pipe(
    Stream.fromReadableStream(
      () => file.stream(),
      (e) => new Error("Failed to parse CSV", { cause: e }),
    ),
    Stream.map((chunk) => decoder.decode(chunk)),
    Stream.splitLines,
    Stream.drop(skipRowsNumber),
    Stream.map(parseCsvLine),
    Stream.map(mapProductCsvRow),
    Stream.runFold(
      [] as Array<Pick<ProductCsvRow, "codigo" | "producto">>,
      (acc, { codigo, producto }) => {
        acc.push({ codigo, producto });
        return acc;
      },
    ),
    Effect.runPromise,
  );
};
