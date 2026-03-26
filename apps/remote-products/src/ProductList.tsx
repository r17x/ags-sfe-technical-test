import React, { useDeferredValue, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Image,
  Input,
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

const PER_PAGE = 24;

type Props = { featureFlags?: { showRatings?: boolean } };

export default function ProductList({ featureFlags }: Props) {
  const productsState = useProducts();

  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const categories = useMemo(
    () =>
      productsState.status === "ok"
        ? extractCategories(productsState.data)
        : ["all"],
    [productsState],
  );

  const filtered = useMemo(() => {
    if (productsState.status !== "ok") return [];
    const searched = filterBySearch(productsState.data, deferredQuery);
    const categorized = filterByCategory(searched, category);
    return sortByPrice(categorized, sort);
  }, [productsState, deferredQuery, category, sort]);

  const pages = totalPages(filtered.length, PER_PAGE);
  const currentPage = Math.min(page, pages);
  const visible = paginate(filtered, currentPage, PER_PAGE);

  const resetFilters = () => {
    setQuery("");
    setCategory("all");
    setSort("asc");
    setPage(1);
  };

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setPage(1);
  };

  const handleSortChange = (val: SortDirection) => {
    setSort(val);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

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
        <Box flex="1" minW="200px">
          <Input
            placeholder="Search products…"
            aria-label="Search products"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </Box>
        <NativeSelect.Root width="auto" minW="140px">
          <NativeSelect.Field
            aria-label="Filter by category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
        <NativeSelect.Root width="auto" minW="180px">
          <NativeSelect.Field
            aria-label="Sort by price"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortDirection)}
          >
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </Flex>

      {visible.length === 0 ? (
        <Box p="8" textAlign="center">
          <Text color="fg.muted">No products found</Text>
        </Box>
      ) : (
        <SimpleGrid
          as="ul"
          listStyleType="none"
          columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
          gap="4"
        >
          {visible.map((product) => (
            <Card.Root as="li" key={product.id} overflow="hidden">
              <Image
                src={product.image}
                alt={product.name}
                height="200px"
                fit="cover"
                width="100%"
              />
              <Card.Body gap="2" p="3">
                <Text fontWeight="semibold" lineClamp={1}>
                  {product.name}
                </Text>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="bold" fontSize="lg">
                    ${product.price.toFixed(2)}
                  </Text>
                  <Badge colorPalette="blue" variant="subtle">
                    {product.category}
                  </Badge>
                </Flex>
                {featureFlags?.showRatings && (
                  <Text fontSize="sm" color="fg.muted">
                    Rating: {product.rating}/5
                  </Text>
                )}
              </Card.Body>
            </Card.Root>
          ))}
        </SimpleGrid>
      )}

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
    </Stack>
  );
}
