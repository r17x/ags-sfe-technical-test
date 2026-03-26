import { describe, expect, it } from "vitest";
import {
  extractCategories,
  filterByCategory,
  filterBySearch,
  paginate,
  sortByPrice,
  totalPages,
} from "../filters";
import type { Product } from "../Products";

const make = (overrides: Partial<Product> & { id: string }): Product =>
  ({
    name: "Widget",
    price: 10,
    category: "home",
    rating: 4,
    image: "img.jpg",
    ...overrides,
  }) as Product;

const products: ReadonlyArray<Product> = [
  make({ id: "1", name: "Alpha Lamp", price: 30, category: "home" }),
  make({ id: "2", name: "Beta Shirt", price: 10, category: "apparel" }),
  make({ id: "3", name: "Gamma Mug", price: 20, category: "kitchen" }),
  make({ id: "4", name: "Delta Lamp", price: 15, category: "home" }),
];

describe("filterBySearch", () => {
  it("returns all when query is empty", () => {
    expect(filterBySearch(products, "")).toHaveLength(4);
    expect(filterBySearch(products, "  ")).toHaveLength(4);
  });

  it("filters by name case-insensitively", () => {
    const result = filterBySearch(products, "lamp");
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(["1", "4"]);
  });

  it("returns empty when nothing matches", () => {
    expect(filterBySearch(products, "zzz")).toHaveLength(0);
  });
});

describe("filterByCategory", () => {
  it('returns all when category is "all"', () => {
    expect(filterByCategory(products, "all")).toHaveLength(4);
  });

  it("filters by exact category", () => {
    const result = filterByCategory(products, "home");
    expect(result).toHaveLength(2);
  });
});

describe("sortByPrice", () => {
  it("sorts ascending", () => {
    const sorted = sortByPrice(products, "asc");
    expect(sorted.map((p) => p.price)).toEqual([10, 15, 20, 30]);
  });

  it("sorts descending", () => {
    const sorted = sortByPrice(products, "desc");
    expect(sorted.map((p) => p.price)).toEqual([30, 20, 15, 10]);
  });

  it("does not mutate original array", () => {
    const original = [...products];
    sortByPrice(products, "desc");
    expect(products).toEqual(original);
  });
});

describe("paginate", () => {
  it("returns correct page slice", () => {
    const result = paginate(products, 1, 2);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("1");
  });

  it("returns remaining items on last page", () => {
    const result = paginate(products, 2, 3);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("4");
  });
});

describe("totalPages", () => {
  it("calculates correct page count", () => {
    expect(totalPages(10, 3)).toBe(4);
    expect(totalPages(9, 3)).toBe(3);
    expect(totalPages(0, 3)).toBe(1);
  });
});

describe("extractCategories", () => {
  it('returns sorted categories with "all" first', () => {
    const cats = extractCategories(products);
    expect(cats[0]).toBe("all");
    expect(cats.slice(1)).toEqual(["apparel", "home", "kitchen"]);
  });

  it("deduplicates", () => {
    const cats = extractCategories(products);
    expect(cats.filter((c) => c === "home")).toHaveLength(1);
  });
});
