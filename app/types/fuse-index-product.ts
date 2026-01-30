import type { Product } from "./product";

export type FuseIndexProduct = Pick<Product, "codigo" | "producto">;
