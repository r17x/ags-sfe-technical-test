import React from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import ProductList from "./ProductList";

function DevPage() {
  return (
    <ChakraProvider value={defaultSystem}>
      <div style={{ fontFamily: "system-ui, sans-serif", padding: 16 }}>
        <h1 style={{ fontSize: 20 }}>Remote Products (Dev Playground)</h1>
        <ProductList featureFlags={{ showRatings: true }} />
      </div>
    </ChakraProvider>
  );
}

createRoot(document.getElementById("root")!).render(<DevPage />);
