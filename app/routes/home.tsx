import { Outlet, Link, redirect } from "react-router";
import { Button } from "~/components/ui/button";
import type { Route } from "./+types/home";
import { CSV_NAME } from "~/constants";
import { pipe, Stream, Effect, Console } from "effect";
import { parseCsvLine } from "~/lib/parse-csv-line";
import { mapProductCsvRow } from "~/lib/map-product-csv-row";
import Fuse from "fuse.js";
import type { ProductCsvRow } from "~/types/product-csv-row";

let fuse: Fuse<Pick<ProductCsvRow, "codigo" | "producto">> | null = null;

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
    Stream.tap((row) => Console.log(row)),
    Stream.runCollect,
    Effect.runPromise,
  );
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const bucket = context.cloudflare.env.fuse_dux;
  const file = await bucket.get(CSV_NAME);
  if (!file && url.pathname === "/") return redirect("/upload");
  return { message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Fuse Dux</h1>
      <Button asChild>
        <Link to="/upload">Subir CSV</Link>
      </Button>
      <Outlet />
    </div>
  );
}
