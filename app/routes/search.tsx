import { Input } from "~/components/ui/input";
import { ProductsTable } from "~/components/products-table";
import {
  redirectDocument,
  useSearchParams,
  type ShouldRevalidateFunction,
} from "react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import Fuse from "fuse.js";
import type { Product } from "~/types/product";
import type { Route } from "./+types/search";
import { FUSE_INDEX_NAME, PRODUCTS_NAME } from "~/constants";
import type { FuseIndexProduct } from "~/types/fuse-index-product";
import { parseNDJsonEffect } from "~/utils/parse-ndjson-effect";
import { Effect } from "effect";

let fuse: {
  body: Fuse<Product>;
  buildedAt: Date;
} | null = null;

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
  const bucket = context.cloudflare.env.fuse_dux_bucket;
  const fuseIndexResponse = await bucket.get(FUSE_INDEX_NAME);
  const productsResponse = await bucket.get(PRODUCTS_NAME);

  let construction = false;

  if (fuseIndexResponse === null || productsResponse === null)
    return redirectDocument("/settings");

  const fuseIndexUploadedAt = fuseIndexResponse.uploaded;

  if (!fuse || fuse.buildedAt < fuseIndexUploadedAt) {
    construction = true;
    const productsIndex = await fuseIndexResponse
      .json()
      .then((fuseIndexProducts) =>
        Fuse.parseIndex<FuseIndexProduct>(fuseIndexProducts as any),
      );

    const products = await parseNDJsonEffect<Product>(
      productsResponse.body,
    ).pipe(Effect.runPromise);

    fuse = {
      body: new Fuse<Product>(
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
      ),
      buildedAt: fuseIndexUploadedAt,
    };
  }

  const search = searchParams.get("search");
  const thereIsResults = search && search.trim().length > 0 && fuse;

  return {
    results: thereIsResults ? fuse.body.search(search, { limit: 10 }) : [],
    construction,
  };
}

export default function Search({ loaderData }: Route.ComponentProps) {
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
  }, [searchDebounce]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar productos..."
            value={inputSearch}
            onChange={(e) => setInputSearch(e.target.value)}
            className="w-75"
          />
        </div>
      </div>

      <ProductsTable results={loaderData.results || []} />
    </div>
  );
}
