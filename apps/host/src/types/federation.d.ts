declare module 'products/ProductList' {
  import * as React from 'react';
  interface Flags { showRatings?: boolean; virtualScroll?: boolean }
  const Component: React.ComponentType<{ featureFlags?: Flags }>;
  export default Component;
}
