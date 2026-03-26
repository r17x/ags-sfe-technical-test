import React, { memo } from "react";
import { Badge, Card, Flex, Image, Text } from "@chakra-ui/react";
import type { Product } from "./Products";

type Props = {
  product: Product;
  showRatings?: boolean | undefined;
  lazy?: boolean | undefined;
  priority?: boolean | undefined;
};

export const ProductCard = memo(function ProductCard({ product, showRatings, lazy, priority }: Props) {
  return (
    <Card.Root as="li" overflow="hidden">
      <Image
        src={product.image}
        alt={product.name}
        height="200px"
        fit="cover"
        width="100%"
        loading={lazy ? "lazy" : undefined}
        {...(priority ? { fetchPriority: "high" } : {})}
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
        {showRatings && (
          <Text fontSize="sm" color="fg.muted">
            Rating: {product.rating}/5
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
});
