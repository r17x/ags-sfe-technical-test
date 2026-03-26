import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import {
  ChakraProvider,
  defaultSystem,
  SimpleGrid,
  Skeleton,
  Box,
  Text,
} from "@chakra-ui/react";
import { ErrorBoundary } from "./components/ErrorBoundary";

const ProductList = lazy(() => import("products/ProductList"));

function LoadingSkeleton() {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap="4">
      {Array.from({ length: 12 }, (_, i) => (
        <Skeleton key={i} height="280px" />
      ))}
    </SimpleGrid>
  );
}

function RemoteError() {
  return (
    <Box p="6" borderWidth="1px" borderColor="red.300" borderRadius="md">
      <Text color="red.500" fontWeight="bold">
        Failed to load Product Catalogue
      </Text>
      <Text color="red.400" fontSize="sm">
        The remote module could not be loaded. Please check that the remote app
        is running on port 3002.
      </Text>
    </Box>
  );
}

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Box fontFamily="system-ui, sans-serif" p="4">
        <Box
          as="header"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="4"
        >
          <Text as="h1" fontSize="xl" fontWeight="bold" m="0">
            Catalog Shell (Host)
          </Text>
          <Text as="small" color="fg.muted">
            Vite &bull; Module Federation &bull; React 19
          </Text>
        </Box>
        <Box as="main">
          <ErrorBoundary fallback={<RemoteError />}>
            <Suspense fallback={<LoadingSkeleton />}>
              <ProductList featureFlags={{ showRatings: true }} />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Box>
    </ChakraProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
