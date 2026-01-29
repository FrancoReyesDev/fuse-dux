import type { ProductCsvRow } from "./product-csv-row";

export type FuseIndexProduct = Pick<ProductCsvRow, "codigo" | "producto">;
