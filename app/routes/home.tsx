import Fuse from "fuse.js";
import type { Route } from "./+types/home";
import {
  Outlet,
  Link,
  redirect,
  useSearchParams,
  type ShouldRevalidateFunction,
  redirectDocument,
} from "react-router";
import { Button } from "~/components/ui/button";
import { FUSE_INDEX_NAME, PRODUCTS_NAME } from "~/constants";
import { ProductsTable } from "~/components/products-table";
import type { Product } from "~/types/product";
import type { FuseIndexProduct } from "~/types/fuse-index-product";
import { Input } from "~/components/ui/input";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { getConfigFromKv } from "~/lib/get-config-from-kv";
import { Effect } from "effect";
import { AppSidebar } from "~/components/app-sidebar";
import { parseNDJsonEffect } from "~/utils/parse-ndjson-effect";

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
  const config = await getConfigFromKv(context.cloudflare.env.fuse_dux_kv).pipe(
    Effect.orElse(() => Effect.succeed(null)),
    Effect.runPromise,
  );

  let construction = false;

  if (
    fuseIndexResponse === null ||
    productsResponse === null ||
    config === null
  )
    return url.pathname === "/" ? redirectDocument("/settings") : null;

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

  if (search && search.trim().length > 0) {
    const results = fuse.body.search(search, { limit: 10 });
    return { results, construction, config };
  }

  return { results: [], construction, config };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputSearch, setInputSearch] = useState(
    searchParams.get("search") || "",
  );

  console.log(loaderData?.construction);

  const [searchDebounce] = useDebounce(inputSearch, 500);

  useEffect(() => {
    const searchValue = searchDebounce.trim();
    if (searchValue.length > 0) {
      setSearchParams({ search: searchValue });
    }
  }, [searchDebounce]);

  return (
    <>
      <AppSidebar orders={[]} config={loaderData!.config} />
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

        <ProductsTable results={loaderData!.results || []} />

        <Outlet />
      </div>
    </>
  );
}
