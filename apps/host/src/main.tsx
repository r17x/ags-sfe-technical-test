import React, { lazy, Suspense, useReducer, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ChakraProvider,
  defaultSystem,
  SimpleGrid,
  Skeleton,
  Box,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import { ErrorBoundary } from "./components/ErrorBoundary";

const productListPromise = import("products/ProductList");
const ProductList = lazy(() => productListPromise);

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

type FlagKey = "showRatings" | "virtualScroll";
type Flags = Record<FlagKey, boolean>;

const defaultFlags: Flags = {
  showRatings: true,
  virtualScroll: true,
};

const flagLabels: Record<FlagKey, string> = {
  showRatings: "Ratings",
  virtualScroll: "Virtual Scroll",
};

function flagsReducer(state: Flags, key: FlagKey): Flags {
  return { ...state, [key]: !state[key] };
}

function FeatureFlagToolbar({
  flags,
  onToggle,
}: {
  flags: Flags;
  onToggle: (key: FlagKey) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Box position="fixed" bottom="4" right="4" zIndex="popover">
      <Flex direction="column" align="end" gap="2">
        {open &&
          (Object.keys(flags) as FlagKey[]).map((key) => (
            <Button
              key={key}
              size="sm"
              colorPalette={flags[key] ? "teal" : "gray"}
              onClick={() => onToggle(key)}
              boxShadow="md"
              borderRadius="full"
            >
              {flagLabels[key] ?? key}: {flags[key] ? "ON" : "OFF"}
            </Button>
          ))}
        <Button
          size="sm"
          colorPalette="blue"
          onClick={() => setOpen((o) => !o)}
          boxShadow="lg"
          borderRadius="full"
        >
          {open ? "Close" : "Feature Flags"}
        </Button>
      </Flex>
    </Box>
  );
}

function App() {
  const [flags, toggleFlag] = useReducer(flagsReducer, defaultFlags);

  return (
    <ChakraProvider value={defaultSystem}>
      <Box
        as="a"
        href="#main-content"
        position="absolute"
        top="-40px"
        left="0"
        bg="blue.600"
        color="white"
        p="2"
        zIndex="skipLink"
        _focus={{ top: "0" }}
      >
        Skip to main content
      </Box>
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
        <Box as="main" id="main-content">
          <ErrorBoundary fallback={<RemoteError />}>
            <Suspense fallback={<LoadingSkeleton />}>
              <ProductList featureFlags={flags} />
            </Suspense>
          </ErrorBoundary>
        </Box>
      </Box>

      <FeatureFlagToolbar flags={flags} onToggle={toggleFlag} />
    </ChakraProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
