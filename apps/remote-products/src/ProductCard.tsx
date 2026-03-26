import React, { memo, useState } from "react";
import { Badge, Card, Flex, Image, Text } from "@chakra-ui/react";
import type { Product } from "./Products";

type Props = {
  product: Product;
  showRatings?: boolean | undefined;
  lazy?: boolean | undefined;
  priority?: boolean | undefined;
};

const liftEffect = { boxShadow: "lg", transform: "translateY(-2px)" } as const;

function renderStars(rating: number) {
  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export const ProductCard = memo(function ProductCard({ product, showRatings, lazy, priority }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <Card.Root
      as="li"
      overflow="hidden"
      transition="box-shadow 0.2s, transform 0.2s"
      _hover={liftEffect}
      _focusWithin={liftEffect}
    >
      {imgError ? (
        <Flex
          aria-hidden
          height="200px"
          width="100%"
          bg="gray.100"
          align="center"
          justify="center"
        >
          <Text fontSize="4xl" color="gray.400" fontWeight="bold">
            {product.name.charAt(0).toUpperCase()}
          </Text>
        </Flex>
      ) : (
        <Image
          src={product.image}
          alt={product.name}
          height="200px"
          fit="cover"
          width="100%"
          loading={lazy ? "lazy" : undefined}
          {...(priority ? { fetchPriority: "high" } : {})}
          onError={() => setImgError(true)}
        />
      )}
      <Card.Body gap="2" p="3">
        <Text fontWeight="semibold" lineClamp={1}>
          {product.name}
        </Text>
        <Flex justify="space-between" align="center">
          <Text fontWeight="bold" fontSize="lg">
            ${product.price.toFixed(2)}
          </Text>
          <Badge colorPalette="blue" variant="subtle" textTransform="capitalize">
            {product.category}
          </Badge>
        </Flex>
        {showRatings && (
          <Text fontSize="sm" color="fg.muted">
            <Text as="span" aria-hidden color="orange.400">
              {renderStars(product.rating)}
            </Text>{" "}
            {product.rating}/5
          </Text>
        )}
      </Card.Body>
    </Card.Root>
  );
});
