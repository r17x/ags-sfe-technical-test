import type { Product } from "./Products";

export type SortDirection = "asc" | "desc";

export const filterBySearch = (
  products: ReadonlyArray<Product>,
  query: string,
): ReadonlyArray<Product> => {
  const q = query.trim().toLowerCase();
  return q === ""
    ? products
    : products.filter((p) => p.name.toLowerCase().includes(q));
};

export const filterByCategory = (
  products: ReadonlyArray<Product>,
  category: string,
): ReadonlyArray<Product> =>
  category === "all"
    ? products
    : products.filter((p) => p.category === category);

export const sortByPrice = (
  products: ReadonlyArray<Product>,
  dir: SortDirection,
): ReadonlyArray<Product> =>
  [...products].sort((a, b) =>
    dir === "asc" ? a.price - b.price : b.price - a.price,
  );

export const paginate = <T>(
  items: ReadonlyArray<T>,
  page: number,
  perPage: number,
): ReadonlyArray<T> => items.slice((page - 1) * perPage, page * perPage);

export const totalPages = (count: number, perPage: number): number =>
  Math.max(1, Math.ceil(count / perPage));

export const extractCategories = (
  products: ReadonlyArray<Product>,
): string[] => [
  "all",
  ...Array.from(new Set(products.map((p) => p.category))).sort(),
];
