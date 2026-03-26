import { Schema, Effect, Context, Layer, Fiber } from "effect";
import { useState, useEffect } from "react";

// ── Schema ──

export class Product extends Schema.Class<Product>("Product")({
  id: Schema.String,
  name: Schema.String,
  price: Schema.Number,
  category: Schema.String,
  rating: Schema.Number,
  image: Schema.String,
}) {}

const Products = Schema.Array(Product);

// ── Errors ──

export class FetchError extends Schema.TaggedError<FetchError>()(
  "FetchError",
  { message: Schema.String },
) {}

export class DecodeError extends Schema.TaggedError<DecodeError>()(
  "DecodeError",
  { message: Schema.String },
) {}

// ── Service ──

export class ProductService extends Context.Tag("ProductService")<
  ProductService,
  { readonly fetchAll: Effect.Effect<ReadonlyArray<Product>, FetchError | DecodeError> }
>() {}

export const ProductServiceLive = Layer.effect(
  ProductService,
  Effect.succeed({
    fetchAll: Effect.gen(function* () {
      const response = yield* Effect.tryPromise({
        try: () => fetch("/api/products"),
        catch: (e) => new FetchError({ message: String(e) }),
      });
      if (!response.ok) {
        return yield* Effect.fail(
          new FetchError({ message: `HTTP ${response.status}` }),
        );
      }
      const json = yield* Effect.tryPromise({
        try: () => response.json(),
        catch: (e) => new FetchError({ message: String(e) }),
      });
      return yield* Schema.decodeUnknown(Products)(json).pipe(
        Effect.mapError((e) => new DecodeError({ message: String(e) })),
      );
    }),
  }),
);

// ── React Hook ──

export type ProductsState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly error: string }
  | { readonly status: "ok"; readonly data: ReadonlyArray<Product> };

export function useProducts(): ProductsState {
  const [state, setState] = useState<ProductsState>({ status: "loading" });

  useEffect(() => {
    const program = Effect.gen(function* () {
      yield* Effect.promise(() =>
        import("./msw/initMsw").then(({ ensureMsw }) => ensureMsw()),
      );
      const svc = yield* ProductService;
      return yield* svc.fetchAll;
    }).pipe(
      Effect.provide(ProductServiceLive),
      Effect.match({
        onSuccess: (data): ProductsState => ({ status: "ok", data }),
        onFailure: (e): ProductsState => ({
          status: "error",
          error: e.message,
        }),
      }),
    );

    const fiber = Effect.runFork(program);

    Effect.runPromise(Fiber.join(fiber)).then((s) => setState(s));

    return () => {
      Effect.runFork(Fiber.interrupt(fiber));
    };
  }, []);

  return state;
}
