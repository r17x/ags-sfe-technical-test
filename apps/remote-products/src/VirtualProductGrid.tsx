import React, { useEffect, useRef } from "react";
import { Box, SimpleGrid, useBreakpointValue } from "@chakra-ui/react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Product } from "./Products";
import { ProductCard } from "./ProductCard";
type Props = {
  filtered: ReadonlyArray<Product>;
  showRatings?: boolean | undefined;
};

const GAP = 16; // Chakra gap="4" = 1rem = 16px
const ESTIMATE = 330; // 314px card + 16px gap

export function VirtualProductGrid({ filtered, showRatings }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cols = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 }) ?? 4;
  const rowCount = Math.ceil(filtered.length / cols);

  const virtualizer = useVirtualizer({
    count: rowCount,
    estimateSize: () => ESTIMATE,
    overscan: 2,
    getScrollElement: () => scrollRef.current,
    gap: GAP,
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [filtered]);

  return (
    <Box
      ref={scrollRef}
      overflow="auto"
      height="calc(100vh - 160px)"
      tabIndex={0}
      role="region"
      aria-label="Product grid"
    >
      <Box
        position="relative"
        width="100%"
        height={`${virtualizer.getTotalSize()}px`}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * cols;
          const rowProducts = filtered.slice(startIndex, startIndex + cols);

          return (
            <SimpleGrid
              as="ul"
              listStyleType="none"
              key={virtualRow.index}
              columns={cols}
              gap="4"
              position="absolute"
              top={0}
              left={0}
              width="100%"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {rowProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showRatings={showRatings}
                  lazy
                />
              ))}
            </SimpleGrid>
          );
        })}
      </Box>
    </Box>
  );
}
