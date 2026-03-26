import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeAll, afterAll, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";

vi.mock("../msw/initMsw", () => ({
  ensureMsw: () => Promise.resolve(),
}));

const sampleProducts = [
  { id: "1", name: "Blue Widget", price: 25.99, category: "home", rating: 4.5, image: "https://prd.place/400?id=1" },
  { id: "2", name: "Red Gadget", price: 15.5, category: "electronics", rating: 3.8, image: "https://prd.place/400?id=2" },
  { id: "3", name: "Green Thingy", price: 42.0, category: "home", rating: 4.9, image: "https://prd.place/400?id=3" },
];

const server = setupServer(
  http.get("/api/products", () => HttpResponse.json(sampleProducts)),
);

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ChakraProvider value={defaultSystem}>{ui}</ChakraProvider>,
  );
}

describe("ProductList (paginated)", () => {
  it("renders loading then products", async () => {
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList featureFlags={{ virtualScroll: false }} />);

    await waitFor(() => {
      expect(screen.getByText("Blue Widget")).toBeInTheDocument();
    });
    expect(screen.getByText("Red Gadget")).toBeInTheDocument();
    expect(screen.getByText("Green Thingy")).toBeInTheDocument();
  });

  it("filters by search", async () => {
    const user = userEvent.setup();
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList featureFlags={{ virtualScroll: false }} />);

    await waitFor(() => {
      expect(screen.getByText("Blue Widget")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Search products"), "gadget");

    await waitFor(() => {
      expect(screen.queryByText("Blue Widget")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Red Gadget")).toBeInTheDocument();
  });

  it("shows ratings when featureFlag is set", async () => {
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList featureFlags={{ showRatings: true, virtualScroll: false }} />);

    await waitFor(() => {
      expect(screen.getByText("Blue Widget")).toBeInTheDocument();
    });

    expect(screen.getByText("4.5/5")).toBeInTheDocument();
  });

  it("hides ratings when featureFlag is not set", async () => {
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList featureFlags={{ virtualScroll: false }} />);

    await waitFor(() => {
      expect(screen.getByText("Blue Widget")).toBeInTheDocument();
    });

    expect(screen.queryByText(/\/5/)).not.toBeInTheDocument();
  });

  it("shows error state on fetch failure", async () => {
    server.use(
      http.get("/api/products", () => new HttpResponse(null, { status: 500 })),
    );

    vi.resetModules();
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList featureFlags={{ virtualScroll: false }} />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load products")).toBeInTheDocument();
    });
  });
});

describe("ProductList (virtual scroll)", () => {
  it("renders scroll container without pagination buttons", async () => {
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList featureFlags={{ virtualScroll: true }} />);

    // Wait for data to load (filters populate with categories)
    await waitFor(() => {
      expect(screen.getByLabelText("Filter by category")).toBeInTheDocument();
    });

    // Virtual scroll path should not render pagination controls
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("defaults to virtual scroll when virtualScroll flag is omitted", async () => {
    const { default: ProductList } = await import("../ProductList");

    renderWithProviders(<ProductList />);

    await waitFor(() => {
      expect(screen.getByLabelText("Filter by category")).toBeInTheDocument();
    });

    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });
});
