import React, { useDeferredValue, useMemo, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Flex,
  Group,
  Input,
  InputElement,
  NativeSelect,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useProducts } from "./Products";
import {
  extractCategories,
  filterByCategory,
  filterBySearch,
  paginate,
  sortByPrice,
  totalPages,
  type SortDirection,
} from "./filters";
import { ProductCard } from "./ProductCard";
import { VirtualProductGrid } from "./VirtualProductGrid";

const PER_PAGE = 24;
const DEFAULT_CATEGORY = "all";
const DEFAULT_SORT: SortDirection = "asc";

type Props = {
  featureFlags?: { showRatings?: boolean; virtualScroll?: boolean };
};

export default function ProductList({ featureFlags }: Props) {
  const productsState = useProducts();
  const isVirtual = featureFlags?.virtualScroll !== false;

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [sort, setSort] = useState(DEFAULT_SORT);

  const categories = useMemo(
    () =>
      productsState.status === "ok"
        ? extractCategories(productsState.data)
        : [DEFAULT_CATEGORY],
    [productsState],
  );

  const filtered = useMemo(() => {
    if (productsState.status !== "ok") return [];
    const searched = filterBySearch(productsState.data, deferredQuery);
    const categorized = filterByCategory(searched, category);
    return sortByPrice(categorized, sort);
  }, [productsState, deferredQuery, category, sort]);

  const resetFilters = () => {
    setQuery("");
    setCategory(DEFAULT_CATEGORY);
    setSort(DEFAULT_SORT);
  };

  const activeFilterCount =
    (query ? 1 : 0) + (category !== DEFAULT_CATEGORY ? 1 : 0) + (sort !== DEFAULT_SORT ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;

  if (productsState.status === "loading") {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="4">
        {Array.from({ length: 12 }, (_, i) => (
          <Skeleton key={i} height="280px" />
        ))}
      </SimpleGrid>
    );
  }

  if (productsState.status === "error") {
    return (
      <Box p="6" borderWidth="1px" borderColor="red.300" borderRadius="md">
        <Text color="red.500" fontWeight="bold">
          Failed to load products
        </Text>
        <Text color="red.400" fontSize="sm">
          {productsState.error}
        </Text>
      </Box>
    );
  }

  return (
    <Stack gap="4">
      <Flex
        as="section"
        aria-label="Filters"
        gap="3"
        wrap="wrap"
        align="center"
      >
        <Group flex="1" minW="200px">
            <Input
              placeholder="Search products…"
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              pe={query ? "8" : undefined}
            />
            {query && (
              <InputElement placement="end">
                <CloseButton
                  size="xs"
                  aria-label="Clear search"
                  onClick={() => setQuery("")}
                />
              </InputElement>
            )}
        </Group>
        <NativeSelect.Root width="auto" minW="140px">
          <NativeSelect.Field
            aria-label="Filter by category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            textTransform="capitalize"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root width="auto" minW="180px">
          <NativeSelect.Field
            aria-label="Sort by price"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortDirection)}
          >
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
        <Button
          variant={hasActiveFilters ? "solid" : "outline"}
          colorPalette={hasActiveFilters ? "blue" : undefined}
          onClick={resetFilters}
        >
          {hasActiveFilters ? `Reset (${activeFilterCount})` : "Reset"}
        </Button>
      </Flex>

      <Text fontSize="sm" color="fg.muted" aria-live="polite" aria-atomic="true">
        {filtered.length === 0
          ? "No products found"
          : `${filtered.length} product${filtered.length === 1 ? "" : "s"} found`}
      </Text>

      {filtered.length === 0 ? (
        <Box p="8" textAlign="center">
          <Text color="fg.muted">No products found</Text>
        </Box>
      ) : isVirtual ? (
        <VirtualProductGrid
          filtered={filtered}
          showRatings={featureFlags?.showRatings}
        />
      ) : (
        <PaginatedGrid
          filtered={filtered}
          showRatings={featureFlags?.showRatings}
        />
      )}
    </Stack>
  );
}

function PaginatedGrid({
  filtered,
  showRatings,
}: {
  filtered: ReadonlyArray<import("./Products").Product>;
  showRatings?: boolean | undefined;
}) {
  const [page, setPage] = useState(1);
  const pages = totalPages(filtered.length, PER_PAGE);
  const currentPage = Math.min(page, pages);
  const visible = paginate(filtered, currentPage, PER_PAGE);

  return (
    <>
      <SimpleGrid
        as="ul"
        listStyleType="none"
        columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
        gap="4"
      >
        {visible.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showRatings={showRatings}
          />
        ))}
      </SimpleGrid>

      {pages > 1 && (
        <Flex justify="center" gap="2" align="center" pt="2">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Text fontSize="sm">
            Page {currentPage} of {pages}
          </Text>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Flex>
      )}
    </>
  );
}
