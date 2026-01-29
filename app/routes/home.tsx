import Fuse from "fuse.js";
import type { Route } from "./+types/home";
import {
  Outlet,
  Link,
  redirect,
  useSearchParams,
  type ShouldRevalidateFunction,
} from "react-router";
import { Button } from "~/components/ui/button";
import { FUSE_INDEX_NAME, PRODUCTS_NAME } from "~/constants";
import { ProductsTable } from "~/components/products-table";
import { CustomProductDialog } from "~/components/custom-product-dialog";
import type { ProductCsvRow } from "~/types/product-csv-row";
import type { FuseIndexProduct } from "~/types/fuse-index-product";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

let fuse: Fuse<ProductCsvRow> | null = null;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dux Busqueda" },
    { name: "description", content: "Buscador de productos y precios" },
  ];
}

export const shouldRevalidate: ShouldRevalidateFunction = ({
  nextUrl,
  currentUrl,
  defaultShouldRevalidate,
}) => {
  if (
    (currentUrl.pathname === "/upload" && nextUrl.pathname === "/") ||
    nextUrl.pathname === "/upload"
  )
    return false;

  return defaultShouldRevalidate;
};

export async function loader({ context, request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const bucket = context.cloudflare.env.fuse_dux;
  const fuseIndexResponse = await bucket.get(FUSE_INDEX_NAME);
  const productsResponse = await bucket.get(PRODUCTS_NAME);
  let construction = false;

  if (fuseIndexResponse === null || productsResponse === null)
    return url.pathname === "/" ? redirect("/upload") : null;

  if (!fuse) {
    construction = true;
    const productsIndex = await fuseIndexResponse
      .json()
      .then((fuseIndexProducts) =>
        Fuse.parseIndex<FuseIndexProduct>(fuseIndexProducts as any),
      );

    const products = await productsResponse
      .text()
      .then(
        (text) =>
          text.split("\n").map((line) => JSON.parse(line)) as ProductCsvRow[],
      );

    fuse = new Fuse<ProductCsvRow>(
      products,
      {
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true,
        minMatchCharLength: 2,
        includeMatches: false,
        shouldSort: true,
      },
      productsIndex,
    );
  }

  const search = searchParams.get("search");

  if (search && search.trim().length > 0) {
    const results = fuse.search(search, { limit: 10 });
    return { results, construction };
  }

  return { results: [], construction };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputSearch, setInputSearch] = useState(
    searchParams.get("search") || "",
  );
  const [searchDebounce] = useDebounce(inputSearch, 500);

  useEffect(() => {
    const searchValue = searchDebounce.trim();
    if (searchValue.length > 0) {
      setSearchParams({ search: searchValue });
    }
  }, [searchDebounce, searchParams]);

  return (
    <div className="container mx-auto py-10 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuse Dux</h1>
          <p className="text-muted-foreground">
            Buscador de productos y precios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar productos..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-75"
          />
          <CustomProductDialog />
          <Button asChild>
            <Link to="/upload">Subir CSV</Link>
          </Button>
        </div>
      </div>

      <ProductsTable results={loaderData?.results || []} />

      <Outlet />
    </div>
  );
}
